import React from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoutes = ({ rolesPermitidos }) => {
    const { store } = useGlobalReducer()

    if (!store.token) {
        return <Navigate to={"/login"} replace />
    }

    if (rolesPermitidos && !rolesPermitidos.includes(store.user?.rol)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />
}