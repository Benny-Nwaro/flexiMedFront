"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsList from "../chat/NotificationList";

type EmergencyFormProps = {
  onSubmit: (formData: { [key: string]: string | number }) => void;
};

const questions = [
  { id: "emergency", text: "What is the nature of your emergency?", options: ["Accident", "Heart Attack", "Stroke", "Other"] },
  { id: "medicalHistory", text: "Do you have any medical history?", options: ["Diabetes", "Hypertension", "Asthma", "None"] },
  { id: "consciousness", text: "Is the patient conscious?", options: ["Yes", "No", "Unresponsive"] },
];

export default function EmergencyForm({ onSubmit }: EmergencyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number; address?: string }>({});
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // Track when to show notifications
  const [userId, setUserId] = useState("");


  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  if (showNotifications) {
    return <NotificationsList userId={userId} ambulanceId={""}  />; // Show NotificationList once confirmed
  }

  // Fetch user location
  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await fetchAddress(latitude, longitude);

          setLocation({ latitude, longitude, address });
          setShowLocationPrompt(true);
        },
        (error) => {
          console.error("Error retrieving location:", error);
          alert("Could not retrieve location. Please enable GPS and try again.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Fetch address from OpenStreetMap (Nominatim)
  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      return data.display_name || "Address not found";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };

  // Handle form submission
  const handleAnswer = (answer: string) => {
    const question = questions[currentStep];
    setFormData((prev) => ({ ...prev, [question.id]: answer }));

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      getUserLocation(); // Get user's location after answering all questions
    }
  };

  // Confirm location and submit form
  const handleConfirmLocation = () => {
    onSubmit({
      ...formData,
      latitude: location.latitude ?? "unknown",
      longitude: location.longitude ?? "unknown",
    });

    // Show NotificationsList after confirmation
    setShowNotifications(true);
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
          <h3 className="text-lg font-semibold mb-3">Confirm Your Location</h3>
          <p className="mb-2">📍 <strong>Address:</strong> {location.address || "Fetching..."}</p>

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
