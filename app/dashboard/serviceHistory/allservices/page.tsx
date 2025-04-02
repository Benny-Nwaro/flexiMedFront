"use client";

import { useEffect, useState } from "react";

interface Request {
  id: string;
  description: string;
  latitude: string;
  longitude: string;
  requestStatus: string;
  requestTime: string;
}

interface ServiceHistory {
  id: string;
  requestId: string;
  eventType: string;
  eventTime: string;
  description: string;
}

export default function RequestsList() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    setToken(userToken);
    fetchRequests(userToken);
  }, []);

  async function fetchRequests(userToken: string | null) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/requests`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch requests");

      const data: Request[] = await response.json();
      setRequests(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  console.log(requests)

  async function fetchServiceHistory(requestId: string) {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/service-history/${requestId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch service history");

      const data: ServiceHistory[] = await response.json();
      setServiceHistory(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setHistoryLoading(false);
    }
  }

  console.log(serviceHistory)
  function openModal(request: Request) {
    setSelectedRequest(request);
    fetchServiceHistory(request.id);
  }

  function closeModal() {
    setSelectedRequest(null);
    setServiceHistory([]);
  }

  if (loading) return <p>Loading requests...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-white shadow-md rounded-lg p-4 border cursor-pointer hover:shadow-lg transition"
          onClick={() => openModal(request)}
        >
          <h3 className="text-lg font-semibold">{request.description}</h3>
          <p className="text-gray-600">📍 {request.latitude}, {request.longitude}</p>
          <p className={`text-sm font-medium ${request.requestStatus === "PENDING" ? "text-yellow-500" : "text-green-600"}`}>
            Status: {request.requestStatus}
          </p>
          <p className="text-xs text-gray-500">Requested: {new Date(request.requestTime).toLocaleString()}</p>
        </div>
      ))}

      {selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold">Service History</h2>
            <p className="text-gray-500">{selectedRequest.description} Request</p>
            {historyLoading ? (
              <p>Loading service history...</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {serviceHistory.length > 0 ? (
                  serviceHistory.map((history) => (
                    <li key={history.id} className="p-2 border rounded">
                      <p className="text-sm">{history.description}</p>
                      <p className="text-xs text-gray-500">Status: {history.eventType}</p>
                      <p className="text-xs text-gray-400">{new Date(history.eventTime).toLocaleString()}</p>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No service history found.</p>
                )}
              </ul>
            )}
            <button
              onClick={closeModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
