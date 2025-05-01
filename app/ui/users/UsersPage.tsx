"use client";

import { useState, useEffect } from "react";
import EmergencyForm from "@/app/ui/emergency/EmergencyForm";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";

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

  const handleEmergencySubmit = async (formData: { [key: string]: string | number }) => {
    if (!user?.userId) return alert("User ID is missing.");

    const requestBody = {
      userId: user.userId,
      latitude: location?.latitude || null,
      longitude: location?.longitude || null,
      requestStatus: "PENDING",
      requestTime: new Date().toISOString(),
      description:
        formData.emergency as string +
        "," +
        formData.medicalHistory as string +
        " " +
        formData.allergies as string +
        " " +
        formData.medications as string +
        " " +
        formData.surgeries as string, // Type assertion
    };
    localStorage.setItem("emergency", JSON.stringify(requestBody.description));

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
      const responseData = await response.json();
      localStorage.setItem("ambulanceId", responseData?.ambulanceId || ""); // Handle potential undefined
      console.log("Emergency request submitted successfully! Response:", responseData);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to submit request:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Failed to submit request: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting emergency request:", error);
    }
  };

  let imageUrl = user?.profileImageUrl?.startsWith("http")
    ? user.profileImageUrl
    : `${process.env.NEXT_PUBLIC_API_URL}${user?.profileImageUrl}`;

  return (
    <div>
      <Link
        href="/dashboard"
        className="flex items-center justify-end text-white text-end cursor-pointer hover:underline space-x-2 max-md:pr-3 max-md:pt-2"
      >
        <span>Dashboard</span>
        <FontAwesomeIcon
          icon={faArrowUpFromBracket}
          className="text-white w-4 h-4 rotate-90"
        />
      </Link>
      <div className="flex flex-col items-center justify-center min-h-fit py-10 px-6">
        {/* Profile Image Avatar */}
        <Image
          src={user?.profileImageUrl ? imageUrl : "/profileImage.png"}
          alt="Profile"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full border"
          onError={(e) => {
            console.error("Image load error:", e);
          }}
        />

        <h2 className="max-md:text-xl text-4xl text-white text-center font-semibold">
          Welcome, {user?.name}!
        </h2>
        <p className="text-lg text-gray-400 max-md:text-sm">
          You're logged in as {user?.role}
        </p>
        <EmergencyForm onSubmit={handleEmergencySubmit} />
      </div>
    </div>
  );
}