import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { logout } from "../services/authServices";

export const Logout = () => {
    const { dispatch } = useGlobalReducer();
    const haSalido = useRef(false);

    useEffect(() => {
        if (haSalido.current) return;
        haSalido.current = true;

        logout();
        dispatch({ type: "LOGOUT" });
    }, []);

    return <Navigate to="/login" replace />;
};
