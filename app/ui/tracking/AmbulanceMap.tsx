"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Client, Message } from "@stomp/stompjs"; // Import Client and Message
import SockJS from "sockjs-client";
import { LatLngExpression } from "leaflet";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

const position: [number, number] = [8.99245976331867, 7.465015634005065];

interface AmbulanceMapProps {
  userId: string;
  ambulanceId: string;
}

export default function AmbulanceMap({ userId, ambulanceId }: AmbulanceMapProps) {
  const [L, setL] = useState<any>(null);
  const [customIcon, setCustomIcon] = useState<any>(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState<LatLngExpression | null>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);

      const newIcon = new leaflet.Icon({
        iconUrl: "/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      setCustomIcon(newIcon);
    });

    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws/ambulance-updates?userId=` + userId);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str);
      },
    });

    stompClient.onConnect = () => {
      stompClient.subscribe(`/topic/ambulance/location/${ambulanceId}`, (message: Message) => {
        try {
          const locationData = JSON.parse(message.body);
          setAmbulanceLocation([parseFloat(locationData.lat), parseFloat(locationData.lng)]);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Body: " + frame.body);
    };

    stompClient.activate();

    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, [userId, ambulanceId]);

  if (!L || !customIcon) return <p>Loading map...</p>;

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
      <MapContainer center={position} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={ambulanceLocation || position} icon={customIcon}>
          <Popup>🚑 Ambulance Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}