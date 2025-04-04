"use client";

import { useEffect, useState } from "react";
import { Mail, Lock, User, Phone, Briefcase } from "lucide-react";
import LoginForm from "./login-form";
import Image from "next/image";

const handleGoogleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
};

// Function to extract the token from the URL and store it in localStorage
const extractAndStoreToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    localStorage.setItem('token', token);
    // Optionally, remove the token from the URL to avoid security risks
    window.history.replaceState({}, document.title, "/"); // Removes query params
    console.log("Token stored in localStorage.");
    // You can also redirect the user to a different page after storing the token.
    // window.location.href = "/dashboard";
  } else{
    console.log("No token present in the URL");
  }

};

export default function SignUpForm({ isOpen, onClose, role }: { isOpen: boolean; onClose: () => void; role: "DISPATCHER" | "USER" | null }) {
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    extractAndStoreToken();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      if (!response.ok) throw new Error("Signup failed. Please try again.");

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  

  if (!isOpen) return null;

  return (
    <div className="rounded-lg p-6 shadow-lg w-96 border-b-2 border-b-white border-t-2 border-t-white py-12 max-md:w-full max-md:rounded-none max-md:shadow-none">
      {showLogin ? (
        <LoginForm onSwitchToSignUp={() => setShowLogin(false)} onClose={onClose} />
      ) : (
        <>
          <h2 className="text-xl text-white font-semibold mb-4">
            {role === "DISPATCHER" ? "Sign Up to register an Ambulance" : "Request an Ambulance"}
          </h2>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="flex items-center px-2 mt-1 text-white bg-blue-900 border-b-1 border-b-white rounded-lg">
              <User className="text-white mr-2" size={18} />
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                className="w-full outline-none bg-inherit border-0 my-2"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="flex items-center px-2 mt-1 text-white bg-blue-900 border-b-1 border-b-white rounded-lg">
              <Mail className="text-white mr-2" size={18} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full outline-none bg-inherit border-0 my-2"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone Number */}
            <div className="flex items-center px-2 mt-1 text-white bg-blue-900 border-b-1 border-b-white rounded-lg">
              <Phone className="text-white mr-2" size={18} />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Enter your phone number"
                className="w-full outline-none bg-inherit border-0 my-2"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="flex items-center px-2 mt-1 text-white bg-blue-900 border-b-1 border-b-white rounded-lg">
              <Lock className="text-white mr-2" size={18} />
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                className="w-full outline-none bg-inherit border-0 my-2"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Role Display */}
            <div className="flex items-center p-2 w-full outline-none bg-inherit border-0">
              <Briefcase className="text-white mr-2" size={18} />
              <p className="text-white">{role === "DISPATCHER" ? "DISPATCHER" : "USER"}</p>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">
              {loading ? "Signing up..." : "Sign Up"}
            </button>

            {/* Google Sign-Up Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full  text-white  rounded-md flex flex-col items-center justify-center  transition "
            >
               or use
              <Image src="/google-logo.png" alt="Google" width={120} height={50} className="mr-2" />
            </button>

            <p className="text-sm text-center text-white mt-2">
              Already have an account?{" "}
              <button onClick={() => setShowLogin(true)} className="text-blue-600 hover:underline">
                Sign in
              </button>
            </p>
          </form>
        </>
      )}
    </div>
  );
}
