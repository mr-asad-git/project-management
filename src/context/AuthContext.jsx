import { createContext, useContext, useState, useEffect } from "react"
import seedUsers from "../data/users"

const SESSION_DURATION = 10 * 60 * 60 * 1000; // 10 hours in milliseconds

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    // Full user list — admins can read and mutate this in real-time
    const [users, setUsers] = useState(seedUsers)

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem("user")
        if (!saved) return null;
        const parsed = JSON.parse(saved);
        if (parsed.loginTimestamp && Date.now() - parsed.loginTimestamp > SESSION_DURATION) {
            localStorage.removeItem("user");
            return null;
        }
        return parsed;
    })

    /* ── Session expiry check ── */
    useEffect(() => {
        if (!currentUser) return;
        const checkSession = () => {
            if (currentUser.loginTimestamp && Date.now() - currentUser.loginTimestamp > SESSION_DURATION) {
                logout();
            }
        };
        const interval = setInterval(checkSession, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [currentUser]);

    /* ── helpers ── */
    const syncCurrent = (updatedUsers) => {
        if (!currentUser) return
        const refreshed = updatedUsers.find(u => u.id === currentUser.id)
        if (refreshed) {
            const nextCurrent = { ...refreshed, loginTimestamp: currentUser.loginTimestamp };
            setCurrentUser(nextCurrent)
            localStorage.setItem("user", JSON.stringify(nextCurrent))
        }
    }

    /* ── Login ── */
    const login = (email, password) => {
        const user = users.find(u => u.email === email && u.password === password)
        if (!user) return { success: false, message: "Invalid email or password." }
        if (user.blocked) return { success: false, message: "Your account has been blocked. Please contact the administrator." }

        const loginUser = { ...user, loginTimestamp: Date.now() };
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
        
        const loginUser = { ...newUser, loginTimestamp: Date.now() };
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