import { useState } from "react";
import useWebSocketNotifications from "@/app/ui/chat/useWebSocketNotifications";
import AmbulanceMap from "../tracking/AmbulanceMap";

interface NotificationData {
  message: string;
  ambulancePlateNumber: string;
  driverName: string;
  driverContact: string;
  eta: string;
  userId: string;
  ambulanceId: string;
}

interface NotificationCardProps {
  notification: NotificationData;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="border-b-2 border-b-white border-r-green-600 border-l-green-600 border-l border-r p-4 rounded-lg shadow-md bg-blue-900">
      <h3 className="text-xl font-bold text-white">🚑 Ambulance Alert</h3>
      <p className="text-white">{notification.message}</p>
      <p className="text-white">Ambulance Plate Number: {notification.ambulancePlateNumber}</p>
      <p className="text-white">Driver Name: {notification.driverName}</p>
      <p className="text-white">Driver Contact: {notification.driverContact}</p>
      <p className="text-white">ETA: {notification.eta}</p>
      <button
        onClick={() => setShowMap(true)}
        className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
      >
        Click to view ambulance location
      </button>

      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg shadow-lg w-[90%] md:w-[70%] lg:w-[50%]">
            <button
              onClick={() => setShowMap(false)}
              className="absolute top-2 right-2 text-red-600 font-bold text-lg"
            >
              ✖
            </button>
            <h3 className="text-lg font-semibold text-black mb-2">Ambulance Location</h3>
            {notification.userId && notification.ambulanceId && (
              <AmbulanceMap userId={notification.userId} ambulanceId={notification.ambulanceId} />
            )}
            {(!notification.userId || !notification.ambulanceId) && <p>Missing User or Ambulance ID</p>}
          </div>
        </div>
      )}
    </div>
  );
};

interface NotificationsListProps {
  userId: string | null;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ userId }) => {
  const notifications: NotificationData[] = useWebSocketNotifications(userId);

  return (
    <div className="max-w-lg mx-auto mt-4 space-y-4 text-white">
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <NotificationCard key={index} notification={notification} />
        ))
      ) : (
        <div className="flex flex-row">
          <p className="text-green-500">Your request was submitted and is being processed</p>
          <p>An email will be sent to you once ambulance is dispatched to your location</p>
        </div>
        
      )}
    </div>
  );
};

export default NotificationsList;