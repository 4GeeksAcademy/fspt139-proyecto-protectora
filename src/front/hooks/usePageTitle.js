import { useEffect } from "react";

export const formatearTitulo = (titulo) =>
    titulo ? `Red Protectora . ${titulo}` : "Red Protectora";

export const usePageTitle = (titulo) => {
    useEffect(() => {
        document.title = formatearTitulo(titulo);
    }, [titulo]);
};