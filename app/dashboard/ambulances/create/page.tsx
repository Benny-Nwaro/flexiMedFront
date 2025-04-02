"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCarSide,
  faMapMarkerAlt,
  faUserTie,
  faPhone,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

interface Driver {
  userId: string;
  name: string;
  phoneNumber: string;
}

export default function CreateAmbulance() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    plateNumber: "",
    latitude: "",
    longitude: "",
    availabilityStatus: false,
    driverId: "",
    phoneNumber: "",
    driverName: "",
  });

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [fetchDriversError, setFetchDriversError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoadingDrivers(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFetchDriversError("User token not found. Please log in.");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/role/DRIVER`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data: Driver[] = await response.json();
          setDrivers(
            data.map((driver) => ({
              ...driver,
              id: driver.userId,
            }))
          );
        } else {
          setFetchDriversError("Failed to fetch drivers.");
        }
      } catch (error: any) {
        setFetchDriversError(`Error fetching drivers: ${error.message}`);
      } finally {
        setLoadingDrivers(false);
      }
    };
    fetchDrivers();
  }, []);

  useEffect(() => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLoadingLocation(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue;

    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else {
      newValue = value;
    }

    if (name === "driverId") {
      const selectedDriver = drivers.find((driver) => driver.name === value);

      if (selectedDriver) {
        setFormData((prev) => ({
          ...prev,
          driverId: selectedDriver.userId,
          phoneNumber: selectedDriver.phoneNumber,
          driverName: selectedDriver.name,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          driverId: value,
          phoneNumber: "",
          driverName: "",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let formErrors: { [key: string]: string } = {};
    if (!formData.plateNumber.trim()) formErrors.plateNumber = "Plate number is required.";
    if (!formData.latitude || !formData.longitude) formErrors.location = "Location is required.";
    if (!formData.driverId) formErrors.driverId = "Driver selection is required.";
    if (!formData.phoneNumber.trim()) formErrors.phoneNumber = "Driver phone number is required.";

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User token not found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ambulances`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plateNumber: formData.plateNumber,
          latitude: parseInt(formData.latitude), // Changed to parseInt
          longitude: parseInt(formData.longitude), // Changed to parseInt
          availabilityStatus: formData.availabilityStatus,
          driverName: formData.driverName,
          driverContact: formData.phoneNumber,
        }),
      });

      if (response.ok) {
        alert("Ambulance created successfully!");
        router.push("/dashboard/ambulances/allambulances");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };
  console.log(drivers);

  console.log(formData);

  if (loadingDrivers) return <p>Loading Drivers...</p>;
  if (fetchDriversError) return <p className="text-red-500">{fetchDriversError}</p>;

  return (
    <div className="max-w-lg mx-auto text-white mt-10 p-6 border-t-2 border-b-2 border-t-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Ambulance</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FontAwesomeIcon icon={faCarSide} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            name="plateNumber"
            placeholder="Plate Number"
            value={formData.plateNumber}
            onChange={handleChange}
            className={`pl-10 p-2 w-full bg-blue-900 rounded-md focus:ring focus:ring-blue-300 ${errors.plateNumber ? "border-red-500" : ""}`}
            required
          />
          {errors.plateNumber && <p className="text-red-500">{errors.plateNumber}</p>}
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            name="latitude"
            placeholder="Latitude"
            value={loadingLocation ? "Fetching location..." : formData.latitude}
            className="pl-10 p-2 w-full bg-blue-900 rounded-md"
            readOnly
          />
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            name="longitude"
            placeholder="Longitude"
            value={loadingLocation ? "Fetching location..." : formData.longitude}
            className="pl-10 p-2 w-full bg-blue-900 rounded-md"
            readOnly
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="availabilityStatus"
            checked={formData.availabilityStatus}
            onChange={handleChange}
          />
          <label className="text-white">Available</label>
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faUserTie} className="absolute left-3 top-3 text-gray-500" />
          <select
            name="driverId"
            value={formData.driverName}
            onChange={handleChange}
            className={`pl-10 p-2 w-full bg-blue-900 rounded-md focus:ring focus:ring-blue-300 ${errors.driverId ? "border-red-500" : ""}`}
            required
          >
            <option value="">Select a Driver</option>
            {drivers.map((driver) => (
              <option key={driver.userId} value={driver.name}>
                {driver.name}
              </option>
            ))}
          </select>
          {errors.driverId && <p className="text-red-500">{errors.driverId}</p>}
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Driver Phone Number"
            value={formData.phoneNumber}
            className={`pl-10 p-2 w-full bg-blue-900 rounded-md ${errors.phoneNumber ? "border-red-500" : ""}`}
            readOnly
          />
          {errors.phoneNumber && <p className="text-red-500">{errors.phoneNumber}</p>}
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faCheckCircle} />
          Create Ambulance
        </button>
      </form>
    </div>
  );
}