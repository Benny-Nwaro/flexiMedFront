"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { LatLngExpression, Icon } from "leaflet";

// Dynamic imports to fix SSR issues with Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

const fallbackPosition: LatLngExpression = [5.99245976331867, 7.465015634005065];

interface AmbulanceMapProps {
  ambulanceId: string;
  userId: string;
  initialLatitude?: number;
  initialLongitude?: number;
}

export default function DriversAmbulanceMap({ ambulanceId, userId }: AmbulanceMapProps) {
  const [icons, setIcons] = useState<{ ambulance: Icon | null; user: Icon | null }>({ ambulance: null, user: null });
  const [location, setLocation] = useState<LatLngExpression>(fallbackPosition);

  // Initialize custom icons
  useEffect(() => {
    import("leaflet").then(leaflet => {
      setIcons({
        ambulance: new leaflet.Icon({
          iconUrl: "/marker-icon.png",
          iconSize: [25, 50],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        user: new leaflet.Icon({
          iconUrl: "/user-marker-icon.png",
          iconSize: [30, 50],
          iconAnchor: [15, 45],
          popupAnchor: [1, -34],
        }),
      });
    });
  }, []);

  // Location tracking and PUT update
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords: LatLngExpression = [latitude, longitude];
        setLocation(coords);

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ambulances/${ambulanceId}/update-location?latitude=${latitude}&longitude=${longitude}&userId=${userId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            const errorText = await res.text(); // read body as text if error
            throw new Error(`HTTP ${res.status}: ${errorText || "Unknown server error"}`);
          }

          const data = await res.json();
          console.log("✅ Location update successful:", data);
        } catch (error) {
          console.error("❌ Failed to update location:", error);
        }
      },
      (err) => {
        console.error("📍 Geolocation error:", err);
        setLocation(fallbackPosition);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [ambulanceId, userId]);

  if (!icons.ambulance || !icons.user) return <p>Loading map...</p>;

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
      <MapContainer center={location} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={location} icon={icons.ambulance}>
          <Popup>🚑 Ambulance Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
