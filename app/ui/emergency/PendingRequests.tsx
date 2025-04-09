import React, { useState, useEffect } from 'react';

interface Request {
  id: string;
  description: string;
  requestTime: string;
  requestStatus: string;
  // Add more fields as necessary
}

interface PendingRequestsProps {
  jwtToken: string;
}

const PendingRequests: React.FC<PendingRequestsProps> = ({ jwtToken }) => {
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/requests/status?status=DISPATCHED`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch pending requests');
        }

        const data: Request[] = await response.json();
        setPendingRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [jwtToken]);

  if (loading) return <div>Loading pending requests...</div>;
  if (error) return <div>Error: {error}</div>;
  if (pendingRequests.length === 0) return <div>No pending requests found.</div>;

  return (
    <div className='text-white mt-5'>
      <h2>You have <span className='text-yellow-500'>{pendingRequests.length} pending request(s)</span></h2>
      <p>click the dashboard button above to handle requests</p>

    </div>
  );
};

export default PendingRequests;
