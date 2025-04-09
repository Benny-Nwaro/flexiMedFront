import React, { useState, useEffect } from 'react';

interface Request {
  id: string;
  description: string;
  requestTime: string;
  requestStatus: string;
  ambulanceId?: string; // Assuming dispatched requests have ambulanceId
}

interface Ambulance {
  id: string;
  plateNumber: string;
  location: string;
  driverName: string;
  driverContact: string;

  // Add more fields as necessary
}

interface StatusRequestsProps {
  jwtToken: string;
}

const StatusRequests: React.FC<StatusRequestsProps> = ({ jwtToken }) => {
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [dispatchedRequests, setDispatchedRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRequestsByStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch pending requests
        const pendingResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/requests/status?status=DISPATCHED`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!pendingResponse.ok) {
          throw new Error('Failed to fetch pending requests');
        }

        const pendingData: Request[] = await pendingResponse.json();
        setPendingRequests(pendingData);

        // Fetch dispatched requests
        const dispatchedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/requests/status?status=DISPATCHED`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!dispatchedResponse.ok) {
          throw new Error('Failed to fetch dispatched requests');
        }

        const dispatchedData: Request[] = await dispatchedResponse.json();
        setDispatchedRequests(dispatchedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestsByStatus();
  }, [jwtToken]);

  const fetchAmbulanceDetails = async (ambulanceId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ambulances/${ambulanceId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch ambulance details');
      }

      const ambulanceData: Ambulance = await response.json();
      setSelectedAmbulance(ambulanceData);
      console.log(ambulanceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleNotifyDriver = async () => {
    if (!selectedAmbulance?.driverContact) {
      alert("Driver contact is missing");
      return;
    }
  
    try {
      const formData = new URLSearchParams();
      formData.append("to", selectedAmbulance.driverContact);
      formData.append("message", "You’ve been dispatched. Please proceed to the emergency location.");
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/sms/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
  
      const result = await response.text();
      if (response.ok) {
        alert(result); // Should return "SMS sent successfully!"
      } else {
        throw new Error(result);
      }
    } catch (error) {
      console.error("Error notifying driver:", error);
      alert("An error occurred while sending the SMS to the driver.");
    }
  };
  
  

  const openModal = (request: Request) => {
    setSelectedRequest(request);
    if (request.ambulanceId) {
      fetchAmbulanceDetails(request.ambulanceId); // Fetch ambulance details if available
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setSelectedAmbulance(null);
    setIsModalOpen(false);
  };

  if (loading) return <div className="text-center py-4">Loading requests...</div>;
  if (error) return <div className="text-center text-red-500 py-4">Error: {error}</div>;

  return (
    <div className="space-y-8 text-white ">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Dispatched Requests</h2>
        {dispatchedRequests.length === 0 ? (
          <div className="text-center py-4">No dispatched requests found.</div>
        ) : (
          <div className="space-y-4">
            {dispatchedRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => openModal(request)} // Open modal on card click
                className="max-w-xl p-6 rounded-lg shadow-md border-b border-b-white border-t-2 border-green-500 cursor-pointer hover:bg-gray-700"
              >
                <h3 className="text-xl font-medium mb-2">Request ID: {request.id}</h3>
                <p className="text-gray-100"><strong>Description:</strong> {request.description}</p>
                <p className="text-gray-100"><strong>Requested At:</strong> {new Date(request.requestTime).toLocaleString()}</p>
                <p className="text-green-500"><strong>Status:</strong> {request.requestStatus}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-blue-900 p-6 rounded-lg max-w-xl w-full max-md:mx-5 border-2">
            {selectedAmbulance && (
                <div className="mt-4">
                <h3 className="text-xl font-semibold lg:text-center mb-3 max-md:text-lg">Dispatched Ambulance Details</h3>
                <p className='max-md:text-sm'><strong>Ambulance Plate Number:</strong> {selectedAmbulance?.plateNumber}</p>
                <p className='max-md:text-sm'><strong>Driver Name:</strong> {selectedAmbulance?.driverName}</p>
                <p className='max-md:text-sm'><strong>Driver Contact:</strong> {selectedAmbulance?.driverContact}</p>
                {/* Add more ambulance fields as necessary */}
            </div>
      
            )}
            
            {/* Add more fields as necessary */}
            <div className='flex flex-row justify-between'>
                <button
                onClick={closeModal}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                >
                Close
                </button>
                    {/* Notify Driver Button */}
                    <button
                        onClick={handleNotifyDriver}
                        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 flex items-center justify-center space-x-2"
                        >
                    <span>Notify Driver</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusRequests;
