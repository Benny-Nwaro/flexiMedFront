// "use client";

// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import "leaflet/dist/leaflet.css";
// import { Client, Message } from "@stomp/stompjs";
// import SockJS from "sockjs-client";
// import { LatLngExpression } from "leaflet";

// // Dynamically import Leaflet components to avoid SSR issues
// const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
// const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
// const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
// const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// const fallbackPosition: [number, number] = [5.99245976331867, 7.465015634005065];

// interface AmbulanceMapProps {
//   userId: string;
//   ambulanceId: string;
// }

// export default function AmbulanceMap({ userId, ambulanceId }: AmbulanceMapProps) {
//   const [L, setL] = useState<any>(null);
//   const [ambulanceIcon, setAmbulanceIcon] = useState<any>(null);
//   const [userIcon, setUserIcon] = useState<any>(null);
//   const [ambulanceLocation, setAmbulanceLocation] = useState<LatLngExpression | null>(null);
//   const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);

//   // Load Leaflet and icons
//   useEffect(() => {
//     import("leaflet").then((leaflet) => {
//       setL(leaflet);

//       const ambIcon = new leaflet.Icon({
//         iconUrl: "/marker-icon.png", // Replace with ambulance icon
//         iconSize: [25, 50],
//         iconAnchor: [12, 41],
//         popupAnchor: [1, -34],
//       });

//       const usrIcon = new leaflet.Icon({
//         iconUrl: "/user-marker-icon.png", // Replace with user icon
//         iconSize: [30, 50],
//         iconAnchor: [15, 45],
//         popupAnchor: [1, -34],
//       });

//       setAmbulanceIcon(ambIcon);
//       setUserIcon(usrIcon);
//     });

//     // Get user GPS location or fallback
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setUserLocation([latitude, longitude]);
//           console.log("User location from GPS:", latitude, longitude);
//         },
//         (error) => {
//           console.error("Error getting user location:", error);
//           setUserLocation(fallbackPosition);
//           console.log("Fallback user location used:", fallbackPosition);
//         },
//         {
//           timeout: 5000,
//           maximumAge: 60000,
//         }
//       );
//     } else {
//       setUserLocation(fallbackPosition);
//       console.log("Geolocation not supported, fallback used:", fallbackPosition);
//     }
//   }, []);

//   // Setup WebSocket listener for ambulance location
//   useEffect(() => {
//     if (!ambulanceIcon) return; // Wait until icon is ready

//     const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws/ambulance-locations`);
//     const stompClient = new Client({
//       webSocketFactory: () => socket,
//       debug: (str) => console.log(str),
//     });

//     stompClient.onConnect = () => {
//       console.log("WebSocket connected");
//       stompClient.subscribe(`/user/${userId}/queue/ambulance-locations`, (message: Message) => {
//         try {
//           const locationData = JSON.parse(message.body);
//           const lat = parseFloat(locationData.lat);
//           const lng = parseFloat(locationData.lng);

//           console.log("Received ambulance location:", lat, lng);

//           if (!isNaN(lat) && !isNaN(lng)) {
//             setAmbulanceLocation([lat, lng]);
//           }
//         } catch (error) {
//           console.error("Error parsing WebSocket message:", error);
//         }
//       });
//     };

//     stompClient.onStompError = (frame) => {
//       console.error("Broker reported error: " + frame.headers["message"]);
//       console.error("Body: " + frame.body);
//     };

//     stompClient.activate();

//     return () => {
//       if (stompClient.active) {
//         stompClient.deactivate();
//       }
//     };
//   }, [userId, ambulanceIcon]);

//   if (!L || !ambulanceIcon || !userIcon) return <p>Loading map...</p>;

//   const center = ambulanceLocation || userLocation || fallbackPosition;

//   return (
//     <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
//       <MapContainer center={center} zoom={13} className="h-full w-full">
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//         {ambulanceLocation && (
//           <Marker position={ambulanceLocation} icon={ambulanceIcon}>
//             <Popup>🚑 Ambulance Location</Popup>
//           </Marker>
//         )}

//         {userLocation && (
//           <Marker position={userLocation} icon={userIcon}>
//             <Popup>📍 Your Location</Popup>
//           </Marker>
//         )}
//       </MapContainer>
//     </div>
//   );
// }
