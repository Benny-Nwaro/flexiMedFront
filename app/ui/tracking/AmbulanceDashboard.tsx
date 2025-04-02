import { useEffect } from "react";
import { startLiveLocationTracking } from "@/app/ui/tracking/LiveLocationUpdater";

const AmbulanceDashboard: React.FC = () => {
  useEffect(() => {
    const ambulanceId: string = "AMB123"; // Unique ambulance ID
    const userId: string = "USER123"; // Assigned dynamically when a user requests

    startLiveLocationTracking(ambulanceId, userId);
  }, []);

  return <h1>Ambulance GPS Tracking is Active...</h1>;
};

export default AmbulanceDashboard;
