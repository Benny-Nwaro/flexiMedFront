"use client";

import React, { useEffect, useState } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

interface Request {
  id: string;
  title: string;
  description: string;
  requestStatus: string;
  requestTime: string;
}

export default function UserRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");

    setUserId(storedUserId);
    setToken(storedToken);

    if (!storedUserId || !storedToken) {
      setErrorMessage("User authentication required.");
      setLoading(false);
      return;
    }

    fetchUserRequests(storedUserId, storedToken);
  }, []);

  const fetchUserRequests = async (userId: string, authToken: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/requests/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch requests.");

      const data: Request[] = await response.json();
      console.log(data)
      setRequests(data);
    } catch (error) {
      setErrorMessage("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  // Function to determine the color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-500"; // Yellow for pending
      case "dispatched":
        return "text-yellow-500"; // Yellow for pending
      case "completed":
        return "text-green-500"; // Green for completed
      case "rejected":
        return "text-red-500"; // Red for rejected
      default:
        return "text-gray-500"; // Default color
    }
  };

  if (loading) return <p>Loading requests...</p>;
  if (errorMessage) return <p className="text-red-500">{errorMessage}</p>;
  if (requests.length === 0) return <p className="text-gray-500">No requests found.</p>;

  return (
    <div className="w-full mx-auto mt-10 p-6 bg-blue-900  rounded-lg">
      <h4 className="text-xl font-semibold mb-4 text-white">Your Requests</h4>
      
      {/* Row layout with wrap support */}
      <div className="flex flex-wrap gap-4">
        {requests.map((request) => (
          <div key={request.id} className={`w-[300px] p-4 border-l-2 shadow-lg border-r-2 rounded-xl  flex items-start ${request.requestStatus === "COMPLETED"? "border-green-500":"border-yellow-400"}`}>
            {/* Dynamic Icon Color */}
            <XCircleIcon className={`h-6 w-6 mr-3 ${getStatusColor(request.requestStatus)}`} />
            <div>
              <h5 className="text-lg font-medium">{request.title}</h5>
              <p className="text-sm text-white">{request.description}</p>
              <p className="text-xs text-white mt-1">Status: {request.requestStatus}</p>
              <p className="text-xs text-white">Created At: {new Date(request.requestTime).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
