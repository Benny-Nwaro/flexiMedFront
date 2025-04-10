"use client";

import { useState, useEffect } from "react";
import { FaAmbulance, FaUser } from "react-icons/fa";
import SignUpForm from "@/app/ui/signup-fom";
import UsersPage from "../users/UsersPage";
import DispatchersPage from "../users/DispatchersPage";
import DriversPage from "../users/DriversPage";

type UserType = {
  userId: string;
  name: string;
  role: string;
  profileImageUrl?: string; // Added profile image field
};

type LocationType = {
  latitude: number;
  longitude: number;
};

export default function AmbulanceForm() {
  const [selectedRole, setSelectedRole] = useState<"DISPATCHER" | "USER" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [isButtonHidden, setIsButtonsHidden] = useState(false);
  const [token, setToken] = useState<string | null>(null);


  // Fetch token from localStorage and re-render on change
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    const checkTokenChange = () => {
      const newToken = localStorage.getItem("token");
      if (newToken !== storedToken) {
        setToken(newToken);
      }
    };

    window.addEventListener("storage", checkTokenChange);
    return () => window.removeEventListener("storage", checkTokenChange);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found in localStorage.");
        return;
      }
      try {
        console.log("Fetching user details...");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch user details: ${response.statusText}`);
        const responseData = await response.json();
        console.log("User Details:", responseData);
        localStorage.setItem("userId", responseData?.userId || "");
        localStorage.setItem("role", user?.role || "");
        setUser(responseData);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.error("Error fetching location:", error),
        { enableHighAccuracy: true }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }, []);
  


  if (user?.role === "USER") {
    if (!token) {
      return <div className="text-white text-center">Loading...</div>;
    }
    return (
      <UsersPage user={user} />
    );
  }else if(user?.role === "DISPATCHER"){
    if (!token) {
      return <div className="text-white text-center">Loading...</div>;
    }
    return(
      <DispatchersPage user={user} jwtToken={token}/>
    )
  }
  else if(user?.role === "DRIVER"){
    if (!token) {
      return <div className="text-white text-center">Loading...</div>;
    }
    return(
      <DriversPage user={user} jwtToken={token}/>
    )
  }
  else{
    return (
    <div className="flex flex-col items-center justify-center min-h-fit lg:px-6">
      <div hidden={isButtonHidden} className="space-y-12 w-full max-w-md max-md:my-12 max-md:px-4">
        <button
          onClick={() => {
            openModal("DISPATCHER");
            setIsButtonsHidden(true);
          }}
          className="flex items-center justify-center w-full lg:h-40 border-b-2 border-white shadow-2xl  p-6 text-white bg-blue-600 rounded-xl  hover:bg-blue-700 transition-all text-2xl font-semibold"
        >
          <FaAmbulance className="mr-3 text-4xl" /> Register an Ambulance
        </button>
        <button
          onClick={() => {
            openModal("USER");
            setIsButtonsHidden(true);
          }}
          className="flex items-center justify-center w-full lg:h-40 p-6 text-white bg-green-600 rounded-xl border-b-2 border-white shadow-2xl hover:bg-blue-700 transition-all text-2xl font-semibold"
        >
          <FaUser className="mr-3 text-4xl" /> Request an Ambulance
        </button>
      </div>
      <SignUpForm isOpen={isModalOpen} onClose={closeModal} role={selectedRole} />
    </div>
  );

  function openModal(role: "DISPATCHER" | "USER") {
    setSelectedRole(role);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedRole(null);
    setIsButtonsHidden(false);
  }
}
}