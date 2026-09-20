import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const TestMapa = () => {

    const [animals, setAnimals] = useState([]);

    useEffect(() => {
        fetch(backendUrl + "/api/animals?per_page=100")
            .then((response) => response.json())
            .then((data) => setAnimals(data.items))
            .catch((error) => console.log(error));
    }, []);

    return (
        <div className="container py-4">
            <h1 className="fw-bold mb-4">Test mapa</h1>

            <MapContainer center={[40.4168, -3.7038]} zoom={12} style={{ height: "500px" }}>

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
                />

                {animals.map((animal, index) => {
                    const partes = animal.map_positioning.split(",");
                    const latitud = Number(partes[0])
                    const longitud = Number(partes[1]) 

                    return (
                        <Marker key={animal.id} position={[latitud, longitud]}>
                            <Popup>
                                <b>{animal.name}</b><br />
                                {animal.breed}<br />
                                {animal.shelter_name}
                            </Popup>
                        </Marker>
                    );
                })}

            </MapContainer>
        </div>
    );
};