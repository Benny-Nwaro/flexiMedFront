"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function AmbulanceTracker() {
  const userId = "USER123"; // This should be dynamically assigned when a user requests
  const [location, setLocation] = useState({ lat: 9.05785, lng: 7.49508 });

  useEffect(() => {
    const ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_API_URL}/ws/ambulance-updates?userId=${userId}`);

    ws.onmessage = (event) => {
      const { lat, lng } = JSON.parse(event.data);
      setLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
    };

    return () => ws.close();
  }, []);

  return (
    <div className="h-screen w-full">
      <h1>Ambulance Live Location</h1>
      <MapContainer center={location} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={location}>
          <Popup>Ambulance is here!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
