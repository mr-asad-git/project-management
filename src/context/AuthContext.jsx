import { createContext, useContext, useState, useEffect } from "react"
import toast from 'react-hot-toast'
import seedUsers from "../data/users"

const SESSION_DURATION = 10 * 60 * 60 * 1000        // 10 hours
const SESSION_DURATION_REMEMBER = 30 * 24 * 60 * 60 * 1000   // 30 days
const USERS_KEY = 'pm_users'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    /* ── Users list — load from localStorage, fall back to seed ── */
    const [users, setUsers] = useState(() => {
        try {
            const saved = localStorage.getItem(USERS_KEY)
            if (saved) return JSON.parse(saved)
        } catch { }
        return seedUsers
    })

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem("user")
        if (!saved) return null
        const parsed = JSON.parse(saved)
        const duration = parsed.rememberMe ? SESSION_DURATION_REMEMBER : SESSION_DURATION
        if (parsed.loginTimestamp && Date.now() - parsed.loginTimestamp > duration) {
            localStorage.removeItem("user")
            return null
        }
        return parsed
    })

    /* ── Persist users to localStorage whenever they change ── */
    useEffect(() => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }, [users])

    /* ── Session expiry check ── */
    useEffect(() => {
        if (!currentUser) return
        const checkSession = () => {
            const now = Date.now()
            const duration = currentUser.rememberMe ? SESSION_DURATION_REMEMBER : SESSION_DURATION
            const loginTime = currentUser.loginTimestamp || 0

            if (now - loginTime > duration) {
                logout(true)
            }
        }
        // Check more frequently (every 10 seconds) for better responsiveness during testing, 
        // though 60 seconds is fine for 10 hours. Let's keep it 30 for a good balance.
        const interval = setInterval(checkSession, 30000)
        return () => clearInterval(interval)
    }, [currentUser])

    /* ── helpers ── */
    const syncCurrent = (updatedUsers) => {
        if (!currentUser) return
        const refreshed = updatedUsers.find(u => u.id === currentUser.id)
        if (refreshed) {
            const nextCurrent = { ...refreshed, loginTimestamp: currentUser.loginTimestamp, rememberMe: currentUser.rememberMe }
            setCurrentUser(nextCurrent)
            localStorage.setItem("user", JSON.stringify(nextCurrent))
        }
    }

    /* ── Login ── */
    const login = (email, password, rememberMe = false) => {
        const user = users.find(u => u.email === email && u.password === password)
        if (!user) return { success: false, message: "Invalid email or password." }
        if (user.blocked) return { success: false, message: "Your account has been blocked. Please contact the administrator." }

        const loginUser = { ...user, loginTimestamp: Date.now(), rememberMe }
        setCurrentUser(loginUser)
        localStorage.setItem("user", JSON.stringify(loginUser))
        return { success: true }
    }

    /* ── Register (public sign-up — always creates a client) ── */
    const register = ({ name, email, password }) => {
        const exists = users.find(u => u.email === email)
        if (exists) return { success: false, message: "An account with this email already exists." }

        const newUser = {
            id: Date.now(),
            customId: `CLT-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            name,
            email,
            password,
            role: "client",
            location: "",
            image: null,
            blocked: false,
        }

        const next = [...users, newUser]
        setUsers(next)

        const loginUser = { ...newUser, loginTimestamp: Date.now(), rememberMe: false }
        setCurrentUser(loginUser)
        localStorage.setItem("user", JSON.stringify(loginUser))
        return { success: true }
    }

    /* ── Update own profile (settings page) ── */
    const updateUser = (updates) => {
        setUsers(prev => {
            const next = prev.map(u => u.id === currentUser?.id ? { ...u, ...updates } : u)
            syncCurrent(next)
            return next
        })
    }

    /* ── Logout ── */
    const logout = (autoSignOut = false) => {
        setCurrentUser(null)
        localStorage.removeItem("user")
        if (autoSignOut) {
            toast.error("Session expired. Please sign in again.", {
                duration: 5000,
                icon: '🕒',
                style: {
                    border: '1px solid #ef4444',
                    padding: '16px',
                    color: '#ef4444',
                    background: '#fff',
                },
            })
        }
    }

    /* ══ Admin-only helpers ══════════════════════════════════════════ */

    /* Add a user directly (admin creates client/manager without sign-up flow) */
    const addUser = ({ name, email, password, role = "client", location = "", customId = "" }) => {
        const exists = users.find(u => u.email === email)
        if (exists) return { success: false, message: "Email already in use." }

        const prefix = role === 'manager' ? 'MGR' : 'CLT'
        const newUser = {
            id: Date.now(),
            customId: customId.trim() || `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            name,
            email,
            password,
            role,
            location,
            image: null,
            blocked: false,
        }
        setUsers(prev => [...prev, newUser])
        return { success: true }
    }

    /* Permanently delete a user (admin only) */
    const removeUser = (id) => {
        setUsers(prev => prev.filter(u => u.id !== id))
    }

    /* Toggle blocked status */
    const blockUser = (id, blocked) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked } : u))
    }

    /* Promote / demote role (client ↔ manager); admin role is immutable */
    const promoteUser = (id, newRole) => {
        setUsers(prev => {
            const next = prev.map(u =>
                u.id === id && u.role !== "admin" ? { ...u, role: newRole } : u
            )
            syncCurrent(next)
            return next
        })
    }

    /* Inline-edit any field on any user row (name, email, location, password, customId) */
    const editUserField = (id, field, value) => {
        setUsers(prev => {
            const next = prev.map(u => u.id === id ? { ...u, [field]: value } : u)
            syncCurrent(next)
            return next
        })
    }

    return (
        <AuthContext.Provider value={{
            currentUser,
            users,
            login,
            register,
            updateUser,
            logout,
            // admin helpers
            addUser,
            removeUser,
            blockUser,
            promoteUser,
            editUserField,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
