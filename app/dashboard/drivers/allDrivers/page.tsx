"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface Driver {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  profileImageUrl?: string;
}

const DriversList = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
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

        if (!response.ok) throw new Error("Failed to fetch drivers");

        const data: Driver[] = await response.json();
        setDrivers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleEditClick = (driver: Driver) => {
    setEditingDriver(driver);
  };

  const handleDeleteClick = async (driverId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("User not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${driverId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete driver");

      // Remove the driver from the state
      setDrivers((prevDrivers) =>
        prevDrivers.filter((driver) => driver.userId !== driverId)
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingDriver) {
      setEditingDriver({ ...editingDriver, [e.target.name]: e.target.value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpdateDriver = async () => {
    if (!editingDriver) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("User not authenticated");
      return;
    }

    const formData = new FormData();
    
    // Convert the UserDTO to a JSON Blob and append it to FormData
    const userDTO = JSON.stringify({
      name: editingDriver.name,
      email: editingDriver.email,
      phoneNumber: editingDriver.phoneNumber,
    });
    
    formData.append("user", new Blob([userDTO], { type: "application/json" }));
    
    // Append the image file if selected
    if (imageFile) {
      formData.append("profileImage", imageFile);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${editingDriver.userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update driver");

      const updatedDriver = await response.json();
      setDrivers((prevDrivers) =>
        prevDrivers.map((d) => (d.userId === updatedDriver.userId ? updatedDriver : d))
      );

      setEditingDriver(null);
      setImageFile(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">Drivers List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <div key={driver.userId} className="p-4 border-b-2 border-t-2 rounded-lg shadow-2xl flex flex-col">
            <Image
              src={driver?.profileImageUrl ?`${process.env.NEXT_PUBLIC_API_URL}${driver?.profileImageUrl}`: "/profileImage.jpeg"}
              alt="Profile"
              width={96}
              height={96}
              className="w-full h-72 object-fill rounded-lg mb-3"
              onError={(e) => {
                console.error("Image load error:", e);
              }}
            />
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{driver.name}</h3>
              <p className="text-xl text-white">{driver.email}</p>
              <p className="text-xl text-white">{driver.phoneNumber}</p>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handleEditClick(driver)}
                className="bg-blue-500 text-white px-4 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(driver.userId)}
                className="bg-red-500 text-white px-4 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Driver Modal */}
      {editingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Edit Driver</h3>
            <label>Driver name</label>
            <input
              type="text"
              name="name"
              value={editingDriver.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-2 text-black"
              placeholder="Name"
            />
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={editingDriver.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-2 text-black"
              placeholder="Email"
            />
            <label>Phone number</label>
            <input
              type="text"
              name="phoneNumber"
              value={editingDriver.phoneNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-2 text-black"
              placeholder="Phone Number"
            />
            <label>Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded mb-2"
            />

            <div className="flex justify-end">
              <button
                onClick={() => setEditingDriver(null)}
                className="mr-2 bg-gray-500 text-white px-4 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDriver}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversList;
