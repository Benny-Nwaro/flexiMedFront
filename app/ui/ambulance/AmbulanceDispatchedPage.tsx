"use client";

import React, { useState, useEffect } from 'react';
import AmbulanceLocation from '@/app/ui/ambulance/AmbulanceLocation';

interface AmbulanceDetails {
  id: string;
  plateNumber: string;
  driverName: string;
  driverContact: string;
  // Add other relevant ambulance details
}

const AmbulanceDispatchedPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [ambulanceDetails, setAmbulanceDetails] = useState<AmbulanceDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [ambulanceId, setAmbulanceId] = useState<string | null>(null);

  // Set localStorage values on client after mount
  useEffect(() => {
    const interval = setInterval(() => {
      const storedAmbulanceId = localStorage.getItem("ambulanceId");
      const storedUserId = localStorage.getItem("userId");
  
      if (storedAmbulanceId && storedAmbulanceId !== "null" && storedAmbulanceId !== "undefined") {
        setAmbulanceId(storedAmbulanceId);
        setUserId(storedUserId || "defaultUserId");
        clearInterval(interval); // Stop polling once we have it
      }
    }, 1000); // Check every second
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  

  useEffect(() => {
    const fetchAmbulanceDetails = async () => {
      if (!ambulanceId) {
        setErrorDetails('Ambulance ID not found.');
        setLoadingDetails(false);
        return;
      }

      setLoadingDetails(true);
      setErrorDetails(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setErrorDetails('Token not found.');
          setLoadingDetails(false);
          return;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ambulances/${ambulanceId}`;
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch ambulance details: ${response.status} - ${response.statusText}. Details: ${errorData}`);
        }

        const data = await response.json();
        console.log(data);
        setAmbulanceDetails(data);
      } catch (error: any) {
        setErrorDetails(error.message);
      } finally {
        setLoadingDetails(false);
      }
    };

    if (ambulanceId) {
      fetchAmbulanceDetails();
    }
  }, [ambulanceId]);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 text-white border-b-2 rounded-xl">
      <p className="text-lg text-green-500 mb-4">
        An ambulance has been dispatched to your location.
      </p>

      {loadingDetails && <p className="mb-4">Loading ambulance details...</p>}
      {errorDetails && <p className="mb-4 text-red-500">Error: {errorDetails}</p>}

      {ambulanceDetails && (
        <div className="mb-4 text-left w-full max-md:text-sm">
          <h3 className="text-xl font-semibold mb-2">Ambulance Details</h3>
          <p>Plate Number: {ambulanceDetails.plateNumber}</p>
          <p>Driver Name: {ambulanceDetails.driverName}</p>
          <p>Driver Contact: {ambulanceDetails.driverContact}</p>
        </div>
      )}

      <button
        onClick={openModal}
        disabled={loadingDetails || !!errorDetails || ambulanceDetails === null}
        className={`mb-4 bg-blue-500 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 max-md:text-sm shadow-2xl text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out ${
          loadingDetails || !!errorDetails || ambulanceDetails === null
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-105 active:scale-95'
        }`}
      >
        Track Ambulance on Map
      </button>

      {showModal && userId && ambulanceId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-md text-gray-800">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4">Ambulance Location</h2>
            <div className="w-full">
              <AmbulanceLocation userId={userId} ambulanceId={ambulanceId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceDispatchedPage;
