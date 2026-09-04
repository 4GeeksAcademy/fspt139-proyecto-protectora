import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./layouts/Layout.jsx";
import { Home } from "./pages/Home.jsx";
import { Adoptar } from "./pages/Adoptar.jsx";
import { AnimalProfile } from "./pages/AnimalProfile.jsx";
import { Protectoras } from "./pages/Protectoras.jsx";
import { Ayuda } from "./pages/Ayuda.jsx";
import { Necesidades } from "./pages/Necesidades.jsx";
import { TestSheltersFilters } from "./pages/TestSheltersFilters.jsx";
import { TestAnimalFilters } from "./pages/TestAnimalFilters.jsx";
import { TestRequestsFilters } from "./pages/TestRequestsFilters.jsx";


import {SimpleLayout} from "./layouts/SimpleLayout";
import {Login} from "./pages/Login";
import {Logout} from "./pages/Logout";
import {ProtectedRoutes} from "./pages/ProtectedRoutes";
import {NotFound} from "./pages/NotFound";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <Home />
            },

            {
                path: "/adoptar",
                element: <Adoptar />
            },
            {
                path: "/adoptar/:id",
                element: <AnimalProfile />
            },
            {
                path: "/protectoras",
                element: <Protectoras />
            },
            {
                path: "/necesidades",
                element: <Necesidades />
            },
            {
                path: "/test-api-shelters",
                element: <TestSheltersFilters />
            },
            {
                path: "/test-api-requests",
                element: <TestRequestsFilters />
            },
            {
                path: "/ayuda",
                element: <Ayuda />
            },
            {
                element: <ProtectedRoutes />,
                children: [
                    {
                        path: "/test-api-animals",
                        element: <TestAnimalFilters />
                    },
                ]
            },
        ]
    },
    {
        path: "/",
        element: <SimpleLayout />,
        children: [
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/logout",
                element: <Logout />
            },
            // PAGINA DE ERROR 404
            {
                path: "*",
                element: <NotFound />
            }
        ]
    },

]);
