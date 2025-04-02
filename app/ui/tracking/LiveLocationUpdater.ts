export function startLiveLocationTracking(ambulanceId: string, userId: string): void {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }
  
    navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ambulanceId, // Unique ambulance ID
            userId, // The user requesting the ambulance
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        }).catch((error) => console.error("Failed to update location:", error));
      },
      (error: GeolocationPositionError) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true }
    );
  }
  