import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { NavbarSimple } from "../components/NavbarSimple"


export const SimpleLayout = () => {

    return (
        <ScrollToTop>
            <NavbarSimple />
            <Outlet />
        </ScrollToTop>
    )
}