"use client";

import React, { useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";

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
  const [L, setL] = useState<any>(null);
  const [ambulanceIcon, setAmbulanceIcon] = useState<any>(null);
  const [userIcon, setUserIcon] = useState<any>(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState<LatLngExpression | null>(null);
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);
  const [loading, setLoading] = useState(true);  // Added loading state
  const [error, setError] = useState<string | null>(null); // Added error state


  // Load Leaflet and icons
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);

      const ambIcon = new leaflet.Icon({
        iconUrl: "/marker-icon.png", // Replace with ambulance icon
        iconSize: [25, 50],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const usrIcon = new leaflet.Icon({
        iconUrl: "/user-marker-icon.png", // Replace with user icon
        iconSize: [30, 50],
        iconAnchor: [15, 45],
        popupAnchor: [1, -34],
      });

      setAmbulanceIcon(ambIcon);
      setUserIcon(usrIcon);
    });

    // Get user GPS location or fallback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          console.log("User location from GPS:", latitude, longitude);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setUserLocation(fallbackPosition);
          console.log("Fallback user location used:", fallbackPosition);
        },
        {
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    } else {
      setUserLocation(fallbackPosition);
      console.log("Geolocation not supported, fallback used:", fallbackPosition);
    }
  }, []);


  // Fetch ambulance location and update it every 5 seconds
  useEffect(() => {
    const fetchAmbulanceLocation = async () => {
      if (!ambulanceId) {
        setError('Ambulance ID not available.');
        setLoading(false);
        return;
      }
      if (!L) return;

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token not found in local storage.');
          setLoading(false);
          return;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ambulances/${ambulanceId}/location`;
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch ambulance location: ${response.status} - ${response.statusText}. Details: ${errorText}`);
        }

        const data = await response.json();
        console.log("Ambulance Location Data:", data);
        setAmbulanceLocation([data.latitude, data.longitude]);

      } catch (error: any) {
        setError(error.message);
        console.error("Error fetching ambulance location:", error);
      } finally {
        setLoading(false);
      }
    };


    fetchAmbulanceLocation(); // Fetch immediately on component mount

    const intervalId = setInterval(fetchAmbulanceLocation, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [ambulanceId, L]);

  if (loading) {
    return <div>Loading ambulance and map...</div>; // Combined loading message
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!L || !ambulanceIcon || !userIcon) return <p>Loading map...</p>; // Ensure Leaflet is loaded

  const center = ambulanceLocation || userLocation || fallbackPosition;

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {ambulanceLocation && (
          <Marker position={ambulanceLocation} icon={ambulanceIcon}>
            <Popup>Ambulance Location</Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>User Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default AmbulanceLocation;
