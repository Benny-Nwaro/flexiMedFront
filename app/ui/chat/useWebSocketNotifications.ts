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

    console.log(`WebSocket: Connecting for user ${userId}...`);

    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws/ambulance-updates?userId=${userId}`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log("WebSocket Debug: ", str);  // Debug logs for WebSocket activity
      },
    });

    stompClient.onConnect = () => {
      console.log(`WebSocket: Connected for user ${userId}. Subscribing to notifications...`);
      stompClient.subscribe("/user/queue/ambulance-locations", (message: Message) => {
        console.log(`WebSocket: Received message for user ${userId}`);
        try {
          const notificationData: NotificationData = JSON.parse(message.body);
          console.log(`WebSocket: Parsed notification:`, notificationData); // Log parsed notification data
          setNotifications((prevNotifications) => [...prevNotifications, notificationData]);
        } catch (error) {
          console.error("WebSocket: Error parsing notification:", error);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("WebSocket: Broker reported error: " + frame.headers["message"]);
      console.error("WebSocket: Error body: " + frame.body);
    };

    stompClient.onWebSocketClose = () => {
      console.warn("WebSocket: Connection closed.");
    };

    stompClient.onDisconnect = () => {
      console.log("WebSocket: Disconnected.");
    };

    stompClient.activate();

    return () => {
      console.log(`WebSocket: Deactivating connection for user ${userId}...`);
      if (stompClient.active) {
        stompClient.deactivate().catch(console.error);
      }
    };
  }, [userId]);

  console.log("WebSocket Notifications:", notifications);

  return notifications;
};

export default useWebSocketNotifications;
