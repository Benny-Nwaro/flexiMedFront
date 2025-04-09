"use client";

import React, { useEffect, useState } from "react";

interface PatientRecord {
  id: string;
  requestId: string;
  contact: string;
  medicalNotes: string;
  patientId: string; // Assuming your backend DTO has patientId
}

export default function PatientRecordCard() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [updatedPatient, setUpdatedPatient] = useState<Partial<PatientRecord>>({});

  useEffect(() => {
    // Retrieve patient ID and token from localStorage
    const storedPatientId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!storedPatientId) {
      setError("Patient ID not found in localStorage.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("User token not found. Please log in again.");
      setLoading(false);
      return;
    }

    setPatientId(storedPatientId);
    fetchPatientRecordByPatientId(storedPatientId, token);
  }, []);

  // Fetch patient record by patientId using the new controller endpoint
  const fetchPatientRecordByPatientId = async (patientId: string, token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/patients/by-patient-id/${patientId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized access. Please log in again.");
        if (response.status === 404) throw new Error("Patient record not found.");
        throw new Error(`Failed to fetch patient record: ${response.status}`);
      }

      const data: PatientRecord = await response.json();
      setPatient(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes in edit mode
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUpdatedPatient({ ...updatedPatient, [e.target.name]: e.target.value });
  };

  // Update patient record
  const updatePatientRecord = async () => {
    if (!patientId || !patient?.id) return; // Ensure both patientId and the record's ID are available

    const token = localStorage.getItem("token");
    if (!token) {
      setError("User token missing. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/patients/${patient.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPatient),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized access. Please log in again.");
        throw new Error(`Failed to update record: ${response.status}`);
      }

      const updatedData = await response.json();
      setPatient(updatedData);
      setEditMode(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Delete patient record
  const deletePatientRecord = async () => {
    if (!patient?.id) return;
    if (!confirm("Are you sure you want to delete this record?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("User token missing. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/patients/${patient.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized access. Please log in again.");
        throw new Error(`Failed to delete record: ${response.status}`);
      }

      setPatient(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!patient) return <p className="text-gray-500">No record found.</p>;

  return (
    <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Your Medical History</h2>
      <p><strong>Contact:</strong> {patient.contact}</p>

      {editMode ? (
        <div>
          <textarea
            name="medicalNotes"
            placeholder="Medical Notes"
            defaultValue={patient.medicalNotes}
            onChange={handleInputChange}
            className="w-full p-2 border rounded mb-2"
          ></textarea>
          <button onClick={updatePatientRecord} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Save</button>
          <button onClick={() => setEditMode(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      ) : (
        <div>
          <p><strong>Medical Notes:</strong> {patient.medicalNotes || "None"}</p>
          <div className="mt-4">
            <button onClick={() => setEditMode(true)} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">Edit</button>
            <button onClick={deletePatientRecord} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}