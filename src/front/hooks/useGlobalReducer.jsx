// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext, useEffect, useRef } from "react";
import storeReducer, { initialStore } from "../store"  // Import the reducer and the initial state.
import { fetchProfile, limpiarSession } from "../services/authServices.js";

// Create a context to hold the global state of the application
// We will call this global state the "store" to avoid confusion while using local states
const StoreContext = createContext()

// Define a provider component that encapsulates the store and warps it in a context provider to
// broadcast the information throught all the app pages and components.
export function StoreProvider({ children }) {
    // Initialize reducer with the initial state.
    const [store, dispatch] = useReducer(storeReducer, initialStore())
    const hasRefreshedProfile = useRef(false);

    // Si ya hay token, refrescamos el usuario con /api/profile para no depender de localStorage.
    useEffect(() => {
        if (!store.token || hasRefreshedProfile.current) return;
        hasRefreshedProfile.current = true;

        fetchProfile()
            .then((user) => dispatch({ type: "set-user", payload: user }))
            .catch((error) => {
                console.error("No se ha podido refrescar el perfil:", error);
                if (error.status === 401) {
                    limpiarSession();
                    dispatch({ type: "LOGOUT" });
                }
            });
    }, []);

    // Al cargar la app pedimos la ubicacion del usuario por navegador; si el usuario pasa o no quiere darla la obtenemos del store
    useEffect(() => {
        if (!("geolocation" in navigator)) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                dispatch({
                    type: "set_user_location",
                    payload:  `${position.coords.latitude}, ${position.coords.longitude}`
                });
            },
            () => { }
        );
    }, []);

    // Provide the store and dispatch method to all child components.
    return <StoreContext.Provider value={{ store, dispatch }}>
        {children}
    </StoreContext.Provider>
}

// Custom hook to access the global state and dispatch function.
export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext)
    return { dispatch, store };
}