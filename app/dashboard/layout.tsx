"use client";
import SideNav from '@/app/ui/dashboard/sidenav';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImageUrl?: string; 
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data: User = await response.json();
        setUser(data);
        setRole(data.role);
        setUserId(data.id);

        // Store only if values are different
        if (localStorage.getItem("role") !== data.role) {
          localStorage.setItem("role", data.role);
        }
        if (localStorage.getItem("email") !== data.email) {
          localStorage.setItem("email", data.email);
        }
        if (data.profileImageUrl && localStorage.getItem("profileImageUrl") !== data.profileImageUrl) {
          localStorage.setItem("profileImageUrl", data.profileImageUrl);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchUserData();
  }, []);
  let imageUrl = user?.profileImageUrl?.startsWith("http")?user.profileImageUrl : `${process.env.NEXT_PUBLIC_API_URL}${user?.profileImageUrl}`

  return (
    <div className="flex flex-col h-screen md:flex-row bg-blue-900 max-md:overflow-y-scroll">
    {/* Sidebar */}
    <div className="w-full md:w-64 flex-none sticky top-0 z-50">
      <SideNav role={role} userId={userId} />
    </div>
  
    {/* Main Content */}
    <div className="flex flex-col flex-grow">
      {/* Top Navbar with Profile Avatar */}
      <div className="flex justify-end items-center py-4 sticky top-0 max-md:top-40 w-full z-30 px-16 bg-blue-900">
        {/* Profile Image */}
        <div className="relative">
          <Image
            src={user?.profileImageUrl ? imageUrl : "/profileImage.png"}
            alt="Profile"
            width={96}
            height={96}
            className="w-12 h-12 rounded-full border"
            onError={(e) => {
              console.error("Image load error:", e);
            }}
          />
        </div>
      </div>
  
      {/* Page Content */}
      <div className="flex-grow p-4 md:p-12 overflow-y-auto max-w-7xl bg-blue-900">
        {children}
      </div>
    </div>
  </div>
  
  );
}
