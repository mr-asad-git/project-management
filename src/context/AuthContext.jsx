import { createContext, useContext, useState } from "react"
import seedUsers from "../data/users"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    // Full user list — admins can read and mutate this in real-time
    const [users, setUsers] = useState(seedUsers)

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem("user")
        return saved ? JSON.parse(saved) : null
    })

    /* ── helpers ── */
    const syncCurrent = (updatedUsers) => {
        if (!currentUser) return
        const refreshed = updatedUsers.find(u => u.id === currentUser.id)
        if (refreshed) {
            setCurrentUser(refreshed)
            localStorage.setItem("user", JSON.stringify(refreshed))
        }
    }

    /* ── Login ── */
    const login = (email, password) => {
        const user = users.find(u => u.email === email && u.password === password)
        if (!user) return { success: false, message: "Invalid email or password." }
        if (user.blocked) return { success: false, message: "Your account has been blocked. Please contact the administrator." }

        setCurrentUser(user)
        localStorage.setItem("user", JSON.stringify(user))
        return { success: true }
    }

    /* ── Register (public sign-up — always creates a client) ── */
    const register = ({ name, email, password }) => {
        const exists = users.find(u => u.email === email)
        if (exists) return { success: false, message: "An account with this email already exists." }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role: "client",
            location: "",
            image: "/users/u2.svg",
            blocked: false,
        }

        const next = [...users, newUser]
        setUsers(next)
        setCurrentUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
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
    const logout = () => {
        setCurrentUser(null)
        localStorage.removeItem("user")
    }

    /* ══ Admin-only helpers ══════════════════════════════════════════ */

    /* Add a user directly (admin creates client/manager without sign-up flow) */
    const addUser = ({ name, email, password, role = "client", location = "" }) => {
        const exists = users.find(u => u.email === email)
        if (exists) return { success: false, message: "Email already in use." }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role,
            location,
            image: "/users/u2.svg",
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
        setUsers(prev => {
            const next = prev.map(u => u.id === id ? { ...u, blocked } : u)
            return next
        })
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

    /* Inline-edit any field on any user row (name, email, location, password) */
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