"use client";

import { useState, useEffect } from "react";
import EmergencyForm from "@/app/ui/emergency/EmergencyForm";
import Image from "next/image";

type UserType = {
  userId: string;
  name: string;
  role: string;
  profileImageUrl?: string;
};

type LocationType = {
  latitude: number;
  longitude: number;
};

type UsersPageProps = {
  user: UserType | null;
};

export default function UsersPage({ user }: UsersPageProps) {
  const [location, setLocation] = useState<LocationType | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Location access denied. Please enable location services.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleEmergencySubmit = async (formData: { emergency: string }) => {
    if (!user?.userId) return alert("User ID is missing.");
    if (!location) return alert("Location not available. Please enable location services.");

    const requestBody = {
      userId: user.userId,
      latitude: location.latitude,
      longitude: location.longitude,
      requestStatus: "PENDING",
      requestTime: new Date().toISOString(),
      description: formData.emergency,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("You are not authenticated.");

      console.log("Submitting emergency request:", requestBody);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error(`Failed to submit request: ${response.statusText}`);

      console.log("Emergency request submitted successfully!");
      alert("Emergency request submitted!");
    } catch (error) {
      console.error("Error submitting emergency request:", error);
      alert("Failed to submit emergency request.");
    }
  };

  let imageUrl = user?.profileImageUrl?.startsWith("http")?user.profileImageUrl : `http://localhost:8080${user?.profileImageUrl}`

  return (
    <div className="flex flex-col items-center justify-center min-h-fit py-10 px-6">
      {/* Profile Image Avatar */}
      <Image
          src={user?.profileImageUrl ?imageUrl : "/profileImage.png"}
          alt="Profile"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full border"
          onError={(e) => {
            console.error("Image load error:", e);
          }}
        />

      <h2 className="max-md:text-xl text-4xl text-white text-center font-semibold">Welcome, {user?.name}!</h2>
      <p className="text-lg text-gray-400 max-md:text-sm">You're logged in as {user?.role}</p>
      <EmergencyForm onSubmit={handleEmergencySubmit} />
    </div>
  );
}
