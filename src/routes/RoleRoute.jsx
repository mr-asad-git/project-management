import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RoleRoute = ({ allowedRoles = [], redirectPath = '/', children }) => {
    const { currentUser } = useAuth()

    if (!currentUser) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
        return <Navigate to={redirectPath} replace />
    }

    return children ? children : <Outlet />
}

export default RoleRoute
