"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { LatLngExpression, Icon, Marker as LeafletMarker, Map as LeafletMap } from 'leaflet'; // Import Leaflet types

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

const fallbackPosition: [number, number] = [5.99245976331867, 7.465015634005065];

interface AmbulanceMapProps {
  userId: string;
  ambulanceId: string;
}

const AmbulanceLocation: React.FC<AmbulanceMapProps> = ({ userId, ambulanceId }) => {
  const [L, setL] = useState<typeof import('leaflet') | null>(null); // Use the correct type for Leaflet
  const [icons, setIcons] = useState<{ ambulance: Icon, user: Icon } | null>(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState<LatLngExpression | null>(null);
  const [userLocation, setUserLocation] = useState<LatLngExpression>(fallbackPosition);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<LeafletMap | null>(null); // Ref to store the map instance
  const ambulanceMarkerRef = useRef<LeafletMarker | null>(null);

  // Load Leaflet and Icons
  useEffect(() => {
    let isMounted = true;

    import("leaflet").then((leaflet) => {
      if (!isMounted) return;

      setL(leaflet);

      const ambulanceIcon = new leaflet.Icon({
        iconUrl: "/marker-icon.png",
        iconSize: [25, 50],
        iconAnchor: [12, 41],
      });

      const userIcon = new leaflet.Icon({
        iconUrl: "/user-marker-icon.png",
        iconSize: [30, 50],
        iconAnchor: [15, 45],
      });

      setIcons({ ambulance: ambulanceIcon, user: userIcon });
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => isMounted && setUserLocation([coords.latitude, coords.longitude]),
        () => isMounted && setUserLocation(fallbackPosition),
        { timeout: 5000 }
      );
    } else {
      setUserLocation(fallbackPosition);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch ambulance location every 5s
  const fetchAmbulanceLocation = useCallback(async () => {
    if (!ambulanceId || !L) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found.');

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ambulances/${ambulanceId}/location`;
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch ambulance location: ${res.status}`);
      const data = await res.json();
      const newPosition: LatLngExpression = [data.latitude, data.longitude];

      setAmbulanceLocation((prev) => {
        // Explicitly assert the types of prev and newPosition as [number, number]
        const prevPosition = prev as [number, number];
        const newPositionArray = newPosition as [number, number];

        if (!prev || prevPosition[0] !== newPositionArray[0] || prevPosition[1] !== newPositionArray[1]) {
          // Smooth map pan if location changed
          mapRef.current?.flyTo(newPositionArray);
          ambulanceMarkerRef.current?.setLatLng(newPositionArray);
          return newPositionArray;
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ambulanceId, L]);

  useEffect(() => {
    fetchAmbulanceLocation();
    const interval = setInterval(fetchAmbulanceLocation, 5000);
    return () => clearInterval(interval);
  }, [fetchAmbulanceLocation]);

  if (!L || !icons) return <p>Loading map...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const center = ambulanceLocation || userLocation || fallbackPosition;

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        zoomControl={false} // Hide default zoom control
        className="h-full w-full"
        whenReady={() => {}} // Callback with no arguments
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {ambulanceLocation && (
          <Marker
            position={ambulanceLocation}
            icon={icons.ambulance}
            ref={(ref) => { ambulanceMarkerRef.current = ref }}
          >
            <Popup>Ambulance Location</Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker position={userLocation} icon={icons.user}>
            <Popup>User Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default AmbulanceLocation;
