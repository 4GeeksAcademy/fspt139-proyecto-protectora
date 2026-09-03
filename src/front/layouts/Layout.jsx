import { useEffect } from "react"
import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    const { store, dispatch } = useGlobalReducer()

    useEffect(() => {
        if (store.shelterTypes.length > 0 && store.animalTypes.length > 0) return

        const backendUrl = import.meta.env.VITE_BACKEND_URL

        fetch(backendUrl + "/api/data")
            .then((response) => response.json())
            .then((data) => {
                dispatch({ type: "set_shelter_types", payload: data.shelter_types })
                dispatch({ type: "set_animal_types", payload: data.animal_types })
            })
            .catch(() => { })
    }, [])

    return (
        <ScrollToTop>
            <Navbar />
                <Outlet />
            <Footer />
        </ScrollToTop>
    )
}