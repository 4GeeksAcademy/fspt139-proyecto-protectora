import { useState, useEffect, useRef } from "react";
import { getHomeInsights } from "../services/insightsService";

export const TestMapa = () => {

    const [animals, setAnimals] = useState([]);
    const mapaRef = useRef(null);

    useEffect(() => {
        getHomeInsights()
            .then((data) => setAnimals(data.open_adoptions))
            .catch((error) => console.log(error));
    }, []);

    useEffect(() => {

        if (animals.length === 0) return;

        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(css);


        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        document.head.appendChild(script);


        script.onload = () => {

            const mapa = L.map(mapaRef.current).setView([40.4168, -3.7038], 12);

            L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapa);

            animals.forEach((animal) => {
                const partes = animal.map_positioning.split(",");
                const latitud = Number(partes[0]) + 0.1;
                const longitud = Number(partes[1]);

                L.marker([latitud, longitud])
                    .addTo(mapa)
                    .bindPopup("<b>" + animal.name + "</b><br>" + animal.breed);
            });
        };

    }, [animals]);

    return (
        <div className="container py-4">
            <h1 className="fw-bold mb-4">Test mapa</h1>
            <div ref={mapaRef} style={{ height: "500px" }}></div>
        </div>
    );
};