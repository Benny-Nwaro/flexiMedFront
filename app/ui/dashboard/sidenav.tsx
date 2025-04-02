"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import AcmeLogo from "@/app/ui/acme-logo";
import { PowerIcon, UserIcon } from "@heroicons/react/24/outline";
import DashboardLogo from "@/app/ui/dashboard-logo";

interface NavLinksProps {
  role: string | null;
  userId: string | null;
}

export default function SideNav({ role, userId }: NavLinksProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogOut = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (isClient) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      localStorage.removeItem("profileImageUrl");
      window.location.href = "/";
    }
  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-blue-900 border-r-2 border-white text-white">
      <Link
        className="mb-2 flex max-md:h-20 items-end justify-start rounded-md bg-blue-900 md:h-40"
        href="/"
      >
        <div className=" text-white">
          <DashboardLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2 overflow-x-scroll ">
        <NavLinks role={role} userId={userId} />
        <div className="hidden h-auto w-full grow rounded-md bg-blue-900 md:block"></div>

        {/* Profile Link */}
        <Link
          href="/dashboard/users/profile"
          className="flex w-full items-center justify-center gap-2 p-3 text-sm border-b-2 border-white font-medium rounded-md hover:bg-sky-100 hover:text-blue-600 md:justify-start md:p-2 md:px-3"
          aria-label="User Profile"
        >
          <UserIcon className="w-6" />
          <span className="hidden md:block">Profile</span>
        </Link>

        {/* Logout Link */}
        <a
          href="/"
          onClick={handleLogOut}
          className="flex w-full items-center justify-center gap-2 p-3 border-b-2 border-white text-sm font-medium rounded-md hover:bg-sky-100 hover:text-blue-600 md:justify-start md:p-2 md:px-3 cursor-pointer"
          aria-label="Sign Out"
        >
          <PowerIcon className="w-6" />
          <span className="hidden md:block">Sign Out</span>
        </a>
      </div>
    </div>
  );
}
