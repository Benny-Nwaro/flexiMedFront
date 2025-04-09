"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAmbulance,
  faTruckMedical,
  faHandHoldingMedical,
  faNotesMedical,
  faHouseUser,
  faUserTie,
  faBookOpen,
  faPlusMinus,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface NavLinksProps {
  role: string | null;
  userId: string | null;
}

interface NavLink {
  name: string;
  href: string;
  icon: IconDefinition;
  sublinks?: NavLink[];
}

export default function NavLinks({ role }: NavLinksProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const links: NavLink[] =
    role === "DISPATCHER"
      ? [
          { name: "Home", href: "/dashboard", icon: faHouseUser },
          {
            name: "Ambulances",
            href: "/dashboard/ambulances",
            icon: faAmbulance,
            sublinks: [
              { name: "Create Ambulance", href: "/dashboard/ambulances/create", icon: faPlusMinus },
              { name: "View Ambulances", href: "/dashboard/ambulances/allambulances", icon: faTruckMedical },
            ],
          },
          {
            name: "Drivers",
            href: "/dashboard/drivers",
            icon: faUserTie,
            sublinks: [
              { name: "Create Driver", href: "/dashboard/drivers/create", icon: faPlusMinus },
              { name: "View Drivers", href: "/dashboard/drivers/allDrivers", icon: faUserTie }
            ],
          },
          { name: "Service History", href: "/dashboard/serviceHistory/allservices", icon: faBookOpen },
        ]
      : [
          { name: "Home", href: "/dashboard", icon: faHouseUser },
          {
            name: "Requests",
            href: "/dashboard/requests",
            icon: faHandHoldingMedical,
            sublinks: [{ name: "View Requests", href: "/dashboard/requests/userrequests", icon: faHandHoldingMedical }],
          },
          {
            name: "Health Records",
            href: "/dashboard/healthrecords",
            icon: faNotesMedical,
            sublinks: [{ name: "View Records", href: "/dashboard/records/patientrecord", icon: faNotesMedical }],
          },
        ];

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  if (!role) return null;

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href;
        const isDropdownOpen = openDropdown === link.name;

        return (
          <div key={link.name} className="w-full">
            <button
              onClick={(e) => {
                if (link.sublinks) {
                  e.preventDefault();
                  toggleDropdown(link.name);
                } else {
                  router.push(link.href);
                }
              }}
              className={clsx(
                "flex w-full items-center gap-2 p-3 text-sm font-medium rounded-md border-b-2 border-white hover:border-t-2 hover:border-t-white md:px-3",
                { "border-t-2 border-t-green-600 border-b-blue-900 text-white": isActive }
              )}
            >
              <FontAwesomeIcon icon={link.icon} className="text-white w-6 h-6 hover:text-blue-900" />
              <p className="hidden md:block">{link.name}</p>
              {link.sublinks && (
                <span className="ml-auto">
                  {isDropdownOpen ? <ChevronDownIcon className="w-5" /> : <ChevronRightIcon className="w-5" />}
                </span>
              )}
            </button>

            {/* Dropdown Submenu */}
            {isDropdownOpen && link.sublinks && (
              <div className="ml-6 mt-1 space-y-1">
                {link.sublinks.map((sublink) => {
                  const isSublinkActive = pathname === sublink.href;

                  return (
                    <Link
                      key={sublink.name}
                      href={sublink.href}
                      className={clsx(
                        "flex items-center gap-2 p-2 pl-4 text-sm font-medium text-white rounded-md hover:bg-sky-100 hover:text-blue-600 max-md:text-xs max-md:text-nowrap",
                        { "text-blue-600 border-t-2 border-green-500": isSublinkActive }
                      )}
                    >
                      <FontAwesomeIcon icon={sublink.icon} className="text-red-500 w-4 h-4" />
                      {sublink.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
