import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const DriversAmbulanceMap = dynamic(() => import('../tracking/DriversAmbulanceMap'), { ssr: false });

interface Request {
  id: string;
  description: string;
  requestTime: string;
  requestStatus: string;
  latitude: number;
  longitude: number;
  ambulanceId: string;
  userId: string;
}

interface Ambulance {
  id: string;
  plateNumber: string;
  model: string;
  latitude?: number; // Add optional latitude for ambulance
  longitude?: number; // Add optional longitude for ambulance
}

interface DriversPendingRequestsProps {
  jwtToken: string;
  userId: string;
}

const DriversPendingRequests: React.FC<DriversPendingRequestsProps> = ({ jwtToken, userId }) => {
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingRequestId, setCompletingRequestId] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedRequestLocation, setSelectedRequestLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchAmbulanceAndRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const storedUserId = localStorage.getItem("userId");
      if (!storedUserId) {
        console.warn('User ID not available to fetch pending requests.');
        setLoading(false);
        return;
      }

      const ambulanceResponse = await fetch(`http://localhost:8080/api/v1/ambulances/driver/${storedUserId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!ambulanceResponse.ok) {
        throw new Error(`Failed to fetch ambulance details for ${storedUserId}`);
      }

      const ambulanceData: Ambulance = await ambulanceResponse.json();
      setAmbulance(ambulanceData);
      const ambulanceId = ambulanceData.id;

      const requestsResponse = await fetch(
        `http://localhost:8080/api/v1/requests/ambulance/${ambulanceId}?status=DISPATCHED`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!requestsResponse.ok) {
        throw new Error(`Failed to fetch dispatched requests for ambulance ${ambulanceId}`);
      }

      const requestsData: Request[] = await requestsResponse.json();
      setPendingRequests(requestsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [jwtToken]);

  useEffect(() => {
    fetchAmbulanceAndRequests(); // Fetch once on mount
  }, [fetchAmbulanceAndRequests]);

  const handleCompleteRequest = useCallback(async (requestId: string) => {
    setCompletingRequestId(requestId);
    setCompletionError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/requests/${requestId}/complete`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to complete request');
      }

      setPendingRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== requestId)
      );
    } catch (err) {
      setCompletionError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setCompletingRequestId(null);
    }
  }, [jwtToken]);

  const openMapModal = useCallback((latitude: number, longitude: number) => {
    setSelectedRequestLocation({ latitude, longitude });
    setIsMapModalOpen(true);
  }, []);

  const closeMapModal = useCallback(() => {
    setIsMapModalOpen(false);
    setSelectedRequestLocation(null);
  }, []);

  if (loading) return <div className='text-white text-center mt-5'>Loading dispatch requests...</div>;
  if (error) return <div className='text-white text-center mt-5'>Error: {error}</div>;
  if (pendingRequests.length === 0) return <div className='text-white text-center mt-5 flex flex-col'>No new dispatch requests.
      <button
        onClick={fetchAmbulanceAndRequests}
        className='mb-4 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded shadow-2xl'
      >
        Refresh Requests
      </button>
  </div>;
  if (completionError) return <div className='text-red-500 text-center mt-5'>Error completing request: {completionError}</div>;

  return (
    <div className='text-white mt-5'>
      <h2 className='text-xl font-bold mb-2 max-md:text-lg'>New Dispatch Request</h2>

      {ambulance && (
        <div className='mb-4'>
          <h3> Ambulance: {ambulance.plateNumber}</h3>
        </div>
      )}

      <div className='mt-4 max-w-lg'>
        {pendingRequests.map((request) => (
          <div key={request.id} className='bg-blue-900 rounded-lg shadow-md  relative'>
            <p className='mb-2'><span className='font-bold'>Description:</span> {request.description.split(",")[0]}</p>
            <p className='mb-2'><span className='font-bold'>Time:</span> {new Date(request.requestTime).toLocaleString()}</p>
            <p className='mb-2'><span className='font-bold'>Status:</span> {request.requestStatus}</p>
            <p className='mb-2'><span className='font-bold'>Patient Location:</span> Lat: {request.latitude.toFixed(6)}, Lng: {request.longitude.toFixed(6)}</p>
            <p className='mb-2'><span className='font-bold'>Patient medical record:</span> {request.description.split(",")[1]}</p>

            <div className='mt-12 bottom-4 left-4 right-4 flex justify-between max-md:flex-col max-md:space-y-3'>
              <button
                onClick={() => openMapModal(request.latitude, request.longitude)}
                className='bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded max-md:text-sm'
              >
                View Location on Map
              </button>
              <button
                onClick={() => handleCompleteRequest(request.id)}
                className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                  completingRequestId === request.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={completingRequestId === request.id}
              >
                {completingRequestId === request.id ? 'Completing...' : 'Complete Request'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isMapModalOpen && selectedRequestLocation && ambulance?.latitude !== undefined && ambulance?.longitude !== undefined && (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center'>
          <div className='bg-white lg:w-5/12 max-md:w-96 h-fit rounded-lg shadow-lg p-6 max-md:p-3 relative'>
            <button
              onClick={closeMapModal}
              className='absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-50'
            >
              <svg className='h-6 w-6 fill-current' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
              </svg>
            </button>
            <div className='h-fit w-full'>
              {selectedRequestLocation && ambulance.latitude !== undefined && ambulance.longitude !== undefined && (
                <DriversAmbulanceMap ambulanceId={ambulance.id} userId={userId}/>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversPendingRequests;