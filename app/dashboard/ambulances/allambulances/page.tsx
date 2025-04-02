"use client";

import { useState, useEffect } from "react";

interface Ambulance {
  id: number;
  plateNumber: string;
  latitude: number;
  longitude: number;
  availabilityStatus: boolean;
  driverName: string;
  driverContact: string;
}

export default function AmbulanceList() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ambulances`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

      const data: Ambulance[] = await response.json();
      setAmbulances(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ambulance: Ambulance) => {
    setEditingAmbulance(ambulance);
  };

  const handleSave = async () => {
    if (!editingAmbulance) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ambulances/${editingAmbulance.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingAmbulance),
      });

      if (!response.ok) throw new Error("Failed to update ambulance.");

      alert("Ambulance updated successfully!");
      setEditingAmbulance(null);
      fetchAmbulances();
    } catch (err) {
      alert("Error updating ambulance.");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized. Please log in.");
      return;
    }

    if (!confirm("Are you sure you want to delete this ambulance?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ambulances/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete ambulance.");

      alert("Ambulance deleted successfully!");
      setAmbulances((prev) => prev.filter((amb) => amb.id !== id));
    } catch (err) {
      alert("Error deleting ambulance.");
      console.error(err);
    }
  };

  if (loading) return <p className="text-white text-center mt-10">Loading ambulances...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-white text-center mb-6">Registered Ambulances</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {ambulances.map((ambulance) => (
          <div key={ambulance.id} className="bg-blue-900 p-4 rounded-lg shadow-md border-b-2 border-b-white relative">
            <img
              src="https://png.pngtree.com/png-clipart/20201224/ourmid/pngtree-flat-hospital-ambulance-png-image_2606143.jpg"
              alt="Ambulance"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-white">{ambulance.plateNumber}</h3>
            <p className="text-gray-300">Driver: {ambulance.driverName}</p>
            <p className="text-gray-300">Contact: {ambulance.driverContact}</p>
            <p className={`text-sm font-bold mt-2 ${ambulance.availabilityStatus ? "text-green-400" : "text-red-400"}`}>
              {ambulance.availabilityStatus ? "Available" : "Unavailable"}
            </p>

            <div className="mt-3 flex justify-between">
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                onClick={() => handleEdit(ambulance)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleDelete(ambulance.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingAmbulance && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-blue-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Ambulance</h3>
            <input
              type="text"
              className="w-full p-2 mb-2 rounded-md bg-gray-800 text-white"
              value={editingAmbulance.driverName}
              onChange={(e) => setEditingAmbulance({ ...editingAmbulance, driverName: e.target.value })}
              placeholder="Driver Name"
            />
            <input
              type="text"
              className="w-full p-2 mb-2 rounded-md bg-gray-800 text-white"
              value={editingAmbulance.driverContact}
              onChange={(e) => setEditingAmbulance({ ...editingAmbulance, driverContact: e.target.value })}
              placeholder="Driver Contact"
            />
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={editingAmbulance.availabilityStatus}
                onChange={(e) => setEditingAmbulance({ ...editingAmbulance, availabilityStatus: e.target.checked })}
              />
              <label className="text-white ml-2">Available</label>
            </div>
            <div className="flex justify-between">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setEditingAmbulance(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
