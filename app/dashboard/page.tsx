"use client";
import { useState, useEffect } from "react";
import StatusRequests from "../ui/dashboard/StatusRequests";

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the role and JWT token from localStorage
    const storedRole = localStorage.getItem("role");
    const token = localStorage.getItem("token"); // Assuming the token is stored under 'jwtToken'

    setRole(storedRole);
    setJwtToken(token);
    setLoading(false);
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!jwtToken) return <p>No authentication token found. Please log in again.</p>; // Optional: handle no token scenario

  return (
    <div className="lg:p-4 relative min-h-screen">
      {/* Pass jwtToken as a prop to StatusRequests component */}
      <StatusRequests jwtToken={jwtToken} />
    </div>
  );
}
