"use client";

import { useEffect, useState } from "react";
import { lusitana } from "@/app/ui/fonts";
import { AtSymbolIcon, KeyIcon, ArrowRightIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
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

export default function LoginForm({ onSwitchToSignUp, onClose }: { onSwitchToSignUp: () => void; onClose: () => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    extractAndStoreToken();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid email or password");

      localStorage.setItem("token", data.token);
      router.push("/"); // Redirect on success
      onClose(); // Close modal after login
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg  lg:p-6 max-md:w-full max-md:rounded-none max-md:shadow-none">
      <h1 className={`${lusitana.className} mb-3 text-2xl text-center font-semibold text-white`}>Log in to Your Account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
        <label className="mb-2 block text-sm font-medium text-white" htmlFor="password">
            email
          </label>
          <div className="relative flex items-center px-2 mt-1  text-white bg-blue-900 border-t-0 border-l-0 border-r-0 border-b-1 border-b-white rounded-lg">
            <input
              className="w-full outline-none bg-inherit border-0 ml-8 my-2"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <AtSymbolIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white  peer-focus:text-blue-500" />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white" htmlFor="password">
            Password
          </label>
          <div className="relative flex items-center px-2 mt-1  text-white bg-blue-900 border-t-0 border-l-0 border-r-0 border-b-1 border-b-white rounded-lg">
            <input
              className="w-full outline-none bg-inherit border-0 ml-8 my-2"
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
            />
            <KeyIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white peer-focus:text-blue-500" />
          </div>
        </div>

        {/* Display Error Message */}
        {error && (
          <div className="mt-2 flex items-center text-red-600">
            <ExclamationCircleIcon className="h-5 w-5" />
            <span className="ml-2 text-sm">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="mt-4 w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-all">
          Log in <ArrowRightIcon className="ml-2 h-5 w-5 text-gray-50" />
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="mt-4 text-center text-sm text-white">
        Don't have an account?{" "}
        <button onClick={onSwitchToSignUp} className="text-blue-600 font-semibold hover:underline">
          Sign up
        </button>
      </div>

         {/* Google Sign-Up Button */}
         <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full  text-white  rounded-md flex flex-col items-center justify-center  transition "
            >
               or use
              <Image src="/google-logo.png" alt="Google" width={120} height={50} className="mr-2" />
            </button>

      {/* Close Button */}
      <button onClick={onClose} className="mt-4 w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 transition">
        Close
      </button>
    </div>
  );
}
