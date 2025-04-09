"use client";

import { useState } from "react";
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon } from "@heroicons/react/24/outline";

const CreateDriverForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ambulanceId, setAmbulanceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const driverData = {
      name,
      email,
      password,
      phoneNumber,
      role: "driver",
      ambulanceId,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        throw new Error("Failed to create driver");
      }

      setSuccessMessage("Driver created successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setPhoneNumber("");
      setAmbulanceId("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg text-white mx-auto mt-8 p-6 border-b-2 border-t-2 rounded-lg shadow-2xl space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Create Driver</h2>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <UserIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Full Name"
          className="mt-1 pl-10 block w-full text-white rounded-md border-gray-300 bg-blue-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          className="mt-1 pl-10 block w-full text-white rounded-md border-gray-300 bg-blue-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <LockClosedIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
          className="mt-1 pl-10 block w-full text-white rounded-md border-gray-300 bg-blue-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <PhoneIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          placeholder="Phone Number"
          className="mt-1 pl-10 block w-full text-white rounded-md border-gray-300 bg-blue-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Driver"}
      </button>

      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      {successMessage && <p className="text-green-500 mt-2 text-center">{successMessage}</p>}
    </form>
  );
};

export default CreateDriverForm;
