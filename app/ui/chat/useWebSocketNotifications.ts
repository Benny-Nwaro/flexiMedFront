import { useState, useEffect } from "react";
import { Client, Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface NotificationData {
  message: string;
  ambulancePlateNumber: string;
  driverName: string;
  driverContact: string;
  eta: string;
  userId: string;
  ambulanceId: string;
}

const useWebSocketNotifications = (userId: string | null): NotificationData[] => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS("http://localhost:8080/ws/ambulance-updates?userId=" + userId);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str);
      },
    });

    stompClient.onConnect = () => {
      stompClient.subscribe("/topic/ambulance/" + userId, (message: Message) => {
        try {
          const notificationData: NotificationData = JSON.parse(message.body);
          setNotifications((prevNotifications) => [...prevNotifications, notificationData]);
        } catch (error) {
          console.error("Error parsing notification:", error);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Body: " + frame.body);
    };

    stompClient.activate();

    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, [userId]);

  return notifications;
};

export default useWebSocketNotifications;