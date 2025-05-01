"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsList from "../chat/NotificationList";

type EmergencyFormProps = {
  onSubmit: (formData: { [key: string]: string | number }) => void;
};

const questions = [
  {
    id: "emergency",
    text: "What is the nature of your emergency?",
    options: ["Accident", "Heart Attack", "Stroke", "Other"],
  },
  {
    id: "medicalHistory",
    text: "Do you have any medical history?",
    options: ["I have Diabetes", "I have Hypertension", "I have Asthma", "No conditions"],
  },
  {
    id: "allergies",
    text: "Do you have any known allergies?",
    options: ["Allergic to some Drugs", "Allergic to some Foods", "Allergic to some Environments", "No allergies"],
  },
  {
    id: "medications",
    text: "Are you currently on any medication?",
    options: ["Yes I am on medication", "No I am not on medication"],
  },
  {
    id: "surgeries",
    text: "Have you had any surgeries in the past?",
    options: ["Yes I have had surgeries", "No i have not had surgeries"],
  },
  {
    id: "consciousness",
    text: "Is the patient conscious?",
    options: ["Yes", "No", "Unresponsive"],
  },
];

const DEFAULT_LOCATION = { latitude: 9.05785, longitude: 7.49508 }; // Example: Abuja

export default function EmergencyForm({ onSubmit }: EmergencyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId, setUserId] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  if (showNotifications) {
    return <NotificationsList userId={userId} />;
  }

  const getUserLocation = () => {
    setLocationError(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await fetchAddress(latitude, longitude);

          setLocation({ latitude, longitude, address });
          setShowLocationPrompt(true);
        },
        async (error) => {
          console.error("Error retrieving location:", error);
          // Suppress alert and directly set default location
          const address = await fetchAddress(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
          setLocation({
            ...DEFAULT_LOCATION,
            address,
          });
          setShowLocationPrompt(true);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      // Suppress alert and directly set default location
      fetchAddress(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude)
        .then((address) => {
          setLocation({
            ...DEFAULT_LOCATION,
            address,
          });
          setShowLocationPrompt(true);
        })
        .catch((error) => {
          console.error("Error fetching default address:", error);
          setLocation({
            ...DEFAULT_LOCATION,
            address: "Address not found", // Or some other default message
          });
          setShowLocationPrompt(true);
        });
    }
  };

  const fetchAddress = async (latitude: number, longitude: number) => {
    setAddressLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      setAddressLoading(false);
      return data.display_name || "Address not found";
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressLoading(false);
      return "Address not found"; // Return a default value instead of an error message
    }
  };

  const handleAnswer = (answer: string) => {
    const question = questions[currentStep];
    setFormData((prev) => ({ ...prev, [question.id]: answer }));

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      getUserLocation();
    }
  };

  const handleConfirmLocation = () => {
    if (location) {
      onSubmit({
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setShowNotifications(true);
    } else {
      setLocationError("Location is required.");
    }
  };

  return (
    <div className="max-w-full mx-auto p-6">
      <h2 className="text-2xl font-bold text-center text-white mb-4">Emergency Details</h2>

      {!showLocationPrompt ? (
        <>
          <div className="relative min-h-[150px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={questions[currentStep].id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="text-lg text-white text-center font-semibold"
              >
                {questions[currentStep].text}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {questions[currentStep].options.map((option) => (
              <motion.button
                key={option}
                onClick={() => handleAnswer(option)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                whileTap={{ scale: 0.95 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center text-white">
          {locationError && <p className="text-red-500">{locationError}</p>}
          <h3 className="text-lg font-semibold mb-3">Confirm Your Location</h3>
          <p className="mb-2">
            📍 <strong>Address:</strong> {addressLoading ? "Loading..." : location?.address || "Fetching..."}
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleConfirmLocation}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Confirm
            </button>
            <button
              onClick={getUserLocation}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}