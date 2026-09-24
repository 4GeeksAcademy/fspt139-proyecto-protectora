import { useEffect } from "react"
import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/navigation/Navbar"
import { Footer } from "../components/Footer"
import { GlobalModal } from "../components/GlobalModal"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"
import { getToken } from "../services/authServices"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    const { store, dispatch } = useGlobalReducer()

    useEffect(() => {
        if (store.shelterTypes.length > 0 && store.animalTypes.length > 0 && store.requestTypes.length > 0) return

        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const token = getToken()

        fetch(backendUrl + "/api/data", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((response) => response.json())
            .then((data) => {
                dispatch({ type: "set_shelter_types", payload: data.shelter_types })
                dispatch({ type: "set_animal_types", payload: data.animal_types })
                dispatch({ type: "set_request_types", payload: data.request_types })
                // if (data.user_location) {
                dispatch({
                    type: "set_user_location",
                    payload: data.user_location,
                })
                // }
            })
            .catch(() => { })
    }, [])

    return (
        <ScrollToTop>
            <GlobalModal />
            <Navbar />
                <Outlet />
            <Footer />
        </ScrollToTop>
    )
}