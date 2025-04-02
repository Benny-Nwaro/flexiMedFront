"use client";

import { useState, useEffect } from "react";

interface Ambulance {
  id: string;
  name: string;
}

const CreateDriverForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ambulanceId, setAmbulanceId] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmbulances = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token"); // Get token
        if (!token) throw new Error("User not authenticated");

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ambulances`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Attach token
          },
        });

        if (!response.ok) throw new Error("Failed to fetch ambulances");

        const data: Ambulance[] = await response.json();
        setAmbulances(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAmbulances();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfileImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const token = localStorage.getItem("token"); // Get token
    if (!token) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", "driver");
    formData.append("ambulanceId", ambulanceId);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`, // Attach token
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create driver");
      }

      setSuccessMessage("Driver created successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setAmbulanceId("");
      setProfileImage(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (successMessage) return <p className="text-green-500">{successMessage}</p>;

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <div>
        <label>Assign Ambulance:</label>
        <select value={ambulanceId} onChange={(e) => setAmbulanceId(e.target.value)} required>
          <option value="">Select an ambulance</option>
          {ambulances.map((ambulance) => (
            <option key={ambulance.id} value={ambulance.id}>
              {ambulance.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Profile Image:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} required />
      </div>

      <button type="submit">Create Driver</button>
    </form>
  );
};

export default CreateDriverForm;
