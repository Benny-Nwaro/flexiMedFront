"use client";

import { useEffect } from "react";

interface AmbulanceGPSUpdaterProps {
  ambulanceId: string;
  userId: string;
  jwtToken: string; // Add JWT token prop
}

const AmbulanceGPSUpdater: React.FC<AmbulanceGPSUpdaterProps> = ({ ambulanceId, userId, jwtToken }) => {
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-location`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`, // Include JWT token
          },
          body: JSON.stringify({
            ambulanceId,
            userId,
            lat: latitude,
            lng: longitude,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              console.error("Failed to update location:", response.status);
            }
          })
          .catch((error) => console.error("Failed to update location:", error));
      },
      (error: GeolocationPositionError) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [ambulanceId, userId, jwtToken]);

  return null; // This component doesn't render anything
};

export default AmbulanceGPSUpdater;