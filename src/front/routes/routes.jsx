import { createBrowserRouter } from "react-router-dom";
import { ContributeProfile } from "../pages/ContributeProfile.jsx";
import { Home } from "../pages/Home.jsx";
import { Adoptar } from "../pages/Adoptar.jsx";
import { AnimalProfile } from "../pages/AnimalProfile.jsx";
import { Protectoras } from "../pages/Protectoras.jsx";
import { Ayuda } from "../pages/Ayuda.jsx";
import { Necesidades } from "../pages/Necesidades.jsx";
import { TerminosyPrivacidad } from "../pages/TerminosyPrivacidad.jsx";
import { TestMapa } from "../pages/TestMapa.jsx";
import { ProtectoraProfile } from "../pages/ProtectoraProfile.jsx";

import { TestSheltersFilters } from "../pages/test/TestSheltersFilters.jsx";
import { TestAnimalFilters } from "../pages/test/TestAnimalFilters.jsx";
import { TestRequestsFilters } from "../pages/test/TestRequestsFilters.jsx";

import { Layout } from "../layouts/Layout.jsx";
import { SimpleLayout } from "../layouts/SimpleLayout";

import { ProtectedRoutes } from "./ProtectedRoutes";
import { NotFound } from "../pages/NotFound";

import { Login } from "../pages/Login";
import { Logout } from "../pages/Logout";
import { Signup } from "../pages/Signup.jsx";

// PAGINAS DE PROTECTORA
import { ProtectoraAnimales } from "../pages/shelter-admin/ProtectoraAnimales.jsx";
import { ProtectoraNecesidades } from "../pages/shelter-admin/ProtectoraNecesidades.jsx";
import { ProtectoraPerfil } from "../pages/shelter-admin/ProtectoraPerfil";
import { ProtectoraAdopciones } from "../pages/shelter-admin/ProtectoraAdopciones";
import { ProtectoraAnimalesForm } from "../pages/shelter-admin/ProtectoraAnimalesForm";
import { ProtectoraNecesidadesForm } from "../pages/shelter-admin/ProtectoraNecesidadesForm";
import { ProtectoraNecesidad } from "../pages/shelter-admin/ProtectoraNecesidad";
import { ProtectoraAdopcionProceso } from "../pages/shelter-admin/ProtectoraAdopcionProceso";

// PAGINAS DE COLABORADOR
import { ColaboradorActividad } from "../pages/volunteer/ColaboradorActividad";
import { ColaboradorPerfil } from "../pages/volunteer/ColaboradorPerfil";

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
                path: "/animal/view/:id",
                element: <AnimalProfile />
            },
            {
                path: "/protectoras",
                element: <Protectoras />
            },
            {
                path: "/protectoras/:id",
                element: <ProtectoraProfile />
            },
            {
                path: "/necesidades",
                element: <Necesidades />
            },
            {
                path: "/necesidades/:id",
                element: <ContributeProfile />
            },
            {
                path: "/ayuda",
                element: <Ayuda />
            },
            {
                path: "/terminos-y-privacidad",
                element: <TerminosyPrivacidad />
            },
            {
              path: "/test-mapa",
              element: <TestMapa />
            },
            // RUTAS DEL ROL PROTECTORA
            {
                element: <ProtectedRoutes rolesPermitidos={["shelter_admin"]} />,
                children: [
                    {
                        path: "/test-api-animals",
                        element: <TestAnimalFilters />
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
                        path: "/panel/necesidades",
                        element: <ProtectoraNecesidades />
                    },
                    {
                        path: "/panel/necesidades/create",
                        element: <ProtectoraNecesidadesForm />
                    },
                    {
                        path: "/panel/necesidades/:id",
                        element: <ProtectoraNecesidad />
                    },
                    {
                        path: "/panel/necesidades/:id/editar",
                        element: <ProtectoraNecesidadesForm />
                    },
                    {
                        path: "/panel/animales",
                        element: <ProtectoraAnimales />
                    },
                    {
                        path: "/panel/animales/create",
                        element: <ProtectoraAnimalesForm />
                    },
                    {
                        path: "/panel/animales/:id",
                        element: <ProtectoraAnimalesForm />
                    },
                    {
                        path: "/panel/adopciones",
                        element: <ProtectoraAdopciones />
                    },
                    {
                        path: "/panel/adopciones/:id",
                        element: <ProtectoraAdopcionProceso />
                    },
                    {
                        path: "/panel/perfil",
                        element: <ProtectoraPerfil />
                    },
                ]
            },
            // RUTAS DEL ROL COLABORADOR
            {
                element: <ProtectedRoutes rolesPermitidos={["volunteer"]} />,
                children: [
                    {
                        path: "/colaborador",
                        element: <ColaboradorActividad />
                    },
                    {
                        path: "/colaborador/perfil",
                        element: <ColaboradorPerfil />
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
            {
                path: "/signup",
                element: <Signup />
            },
            // PAGINA DE ERROR 404
            {
                path: "*",
                element: <NotFound />
            }
        ]
    },
]);