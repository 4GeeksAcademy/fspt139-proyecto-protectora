import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { logout } from "../services/authServices";

export const Logout = () => {
    const { dispatch } = useGlobalReducer();

    useEffect(() => {
        dispatch({ type: "LOGOUT" });
    }, []);

    return <Navigate to="/login" replace />;
};
