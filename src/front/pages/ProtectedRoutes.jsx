import React from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoutes = () => {
    const { store } = useGlobalReducer()

    if (!store.token) {
        return <Navigate to={"/login"} replace />
    }

    return <Outlet />
}