"use client";
import { useState, useEffect } from "react";
import TutorDashboard from "../ui/dashboard/TutorDashboard";
import InstructorsList from "../ui/users/InstructorsList";


export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const storedRole = localStorage.getItem("role");
      setRole(storedRole);
      setLoading(false);
    
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="lg:p-4 relative min-h-screen">
    </div>
  );
}
