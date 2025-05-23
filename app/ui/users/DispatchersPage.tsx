"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import PendingRequests from "../emergency/PendingRequests";
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

type DispatchersPageProps = {
  user: UserType | null;
  jwtToken: string | null; // Add jwtToken prop
};

export default function DispatchersPage({ user, jwtToken }: DispatchersPageProps) {
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

  let imageUrl = user?.profileImageUrl?.startsWith("http")
    ? user.profileImageUrl
    : `${process.env.NEXT_PUBLIC_API_URL}${user?.profileImageUrl}`;

  return (
    <div>
        <Link href="/dashboard" className="flex items-center justify-end text-white text-end cursor-pointer hover:underline space-x-2 max-md:pr-3 max-md:pt-2">
             <span>Dashboard</span>
             <FontAwesomeIcon icon={faArrowUpFromBracket} className="text-white w-4 h-4 rotate-90" />
         </Link>
       <div className="flex flex-col items-center justify-center min-h-fit py-10 px-6">
      {/* Profile Image Avatar */}
      <Image
      src={user?.profileImageUrl ? imageUrl : "/profileImage.jpeg"}
      alt="Profile"
      width={96}
      height={96}
      className="w-24 h-24 rounded-full border"
      onError={(e) => {
      console.error("Image load error:", e);
      }}
      />
      <h2 className="max-md:text-lg text-4xl text-center text-white font-semibold">Welcome, {user?.name}!</h2>
      <p className="text-lg text-gray-400 max-md:text-xs">You're logged in as {user?.role}</p>
      {jwtToken && <PendingRequests jwtToken={jwtToken}/>}
      </div>
          </div>
   
  );
}