import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./layouts/Layout.jsx";
import { Home } from "./pages/Home.jsx";
import { Adoptar } from "./pages/Adoptar.jsx";
import { AnimalProfile } from "./pages/AnimalProfile.jsx";
import { Protectoras } from "./pages/Protectoras.jsx";
import { Ayuda } from "./pages/Ayuda.jsx";
import { Necesidades } from "./pages/Necesidades.jsx";
import { TestApiModels } from "./pages/TestApiModels.jsx";


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
                path: "/test-api-models",
                element: <TestApiModels />
            }, 
            {
                path: "/ayuda",
                element: <Ayuda />
            }
        ]
    }
]);
