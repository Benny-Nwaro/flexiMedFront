"use client";

import React, { useEffect, useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import DashboardLogo from "../dashboard-logo";

interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  createdAt: string;
  profileImageUrl?: string; // URL to display the profile image
}

export default function UserProfileUpdate() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    setToken(storedToken);
    setUserId(storedUserId);

    if (!storedToken || !storedUserId) {
      setErrorMessage("User authentication required.");
      setLoading(false);
      return;
    }

    fetchUserProfile(storedToken, storedUserId);
  }, []);

  const fetchUserProfile = async (authToken: string, userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user profile.");

      const data: UserProfile = await response.json();
      setUser(data);
    } catch (error) {
      setErrorMessage("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };
  console.log(user)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (user) {
      setUser({ ...user, [event.target.name]: event.target.value });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfileImage(event.target.files[0]);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !token || !userId) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("user", new Blob([JSON.stringify(user)], { type: "application/json" }));
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update profile.");

      alert("Profile updated successfully!");
      fetchUserProfile(token, userId); // Refresh profile after update
    } catch (error) {
      setErrorMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (errorMessage) return <p className="text-red-500">{errorMessage}</p>;
 
  let imageUrl = user?.profileImageUrl?.startsWith("http")?user.profileImageUrl : `${process.env.NEXT_PUBLIC_API_URL}${user?.profileImageUrl}`

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow-2xl border-l-2 border-r-2 border-white rounded-lg">
      <div className="bg-blue-900 p-4 text-white text-center rounded-t-lg flex flex-col items-center">
        <DashboardLogo />
        <h4 className="mt-2">Update Profile</h4>
      </div>

      <div className="mt-4 space-y-4">
        {/* Profile Image Upload */}
        <div className="flex flex-col items-center">
          {user?.profileImageUrl && (
        <Image
          src={user?.profileImageUrl ?imageUrl: "/profileImage.jpeg"}
          alt="Profile"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full border"
          onError={(e) => {
            console.error("Image load error:", e);
          }}
        />
          )}
          <label className="mt-2 flex items-center gap-2 cursor-pointer">
            <CameraIcon className="h-5 w-5 text-white" />
            <span className="text-white">Upload Profile Image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* Name Field */}
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white" />
          <input
            type="text"
            name="name"
            value={user?.name || ""}
            onChange={handleInputChange}
            className="w-full border rounded bg-blue-900 text-white p-2 pl-10"
            placeholder="Full Name"
          />
        </div>

        {/* Email Field */}
        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white" />
          <input
            type="email"
            name="email"
            value={user?.email || ""}
            onChange={handleInputChange}
            className="w-full border bg-blue-900 text-white rounded p-2 pl-10"
            placeholder="Email"
          />
        </div>

        {/* Phone Number Field */}
        <div className="relative">
          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white" />
          <input
            type="text"
            name="phoneNumber"
            value={user?.phoneNumber || ""}
            onChange={handleInputChange}
            className="w-full border  bg-blue-900 text-white rounded p-2 pl-10"
            placeholder="Phone Number"
          />
        </div>

        {/* Role Field (Disabled) */}
        <div className="relative">
          <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            name="role"
            value={user?.role || ""}
            disabled
            className="w-full border bg-blue-900 text-gray-500 rounded p-2 pl-10 "
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-4 w-full bg-blue-900 text-white py-2 rounded flex items-center justify-center gap-2"
        >
          {saving ? "Saving..." : "Save Profile"}
          <CheckCircleIcon className="h-8 w-8 text-white" />
        </button>
      </div>
    </div>
  );
}
