import React, { createContext, useContext, useState, useEffect } from "react";
import { Outlet } from "react-router";

// ==========================================
// 1. DATA TYPES CONFIGURATION (TYPES)
// ==========================================
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info" | "loading"; // Added a separate loading status
  message: string;
}

interface NotificationContextType {
  // Opening a notification now RETURNS an ID string so we can track and update it later
  openNotification: (type: Notification["type"], message: string) => string;
  // New function helping update the content/status of an active notification using its ID
  updateNotification: (id: string, type: Notification["type"], message: string) => void;
  // Manual close function
  closeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ==========================================
// 2. CHILD COMPONENT: INDIVIDUAL TOAST ITEM (Toast Item)
// ==========================================
const NotificationItem: React.FC<{ notification: Notification; onClose: () => void }> = ({
  notification,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // IF LOADING STATUS: It will not automatically disappear, waiting to be updated to another status
    if (notification.type === "loading") return;

    // If it is a completed status (success, error, warning, info), automatically close after 4 seconds
    const exitTimer = setTimeout(() => setIsExiting(true), 3700);
    const closeTimer = setTimeout(() => onClose(), 4000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [notification.type, onClose]);

  const handleManualClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  // Minimalist layout theme setup: dark background, white text, and bordered pixel icon based on reference
  const theme = {
    loading: { 
      bg: "bg-[#1d63ed]", // Deep blue
      icon: (
        // Traditional pixel spinning animation effect for loading status
        <span className="inline-block animate-spin border-2 border-white border-t-transparent w-4 h-4 rounded-full"></span>
      )
    },
    info: { 
      bg: "bg-[#1d63ed]", 
      icon: <span className="text-sm select-none">📊</span> 
    },
    success: { 
      bg: "bg-[#0a864f]", // Deep green matching reference image exactly
      icon: (
        <span className="inline-flex items-center justify-center border border-black bg-[#4ade80] px-1 text-[10px] font-bold text-black rounded-sm shadow-[1px_1px_0px_#000] leading-none">
          ✓
        </span>
      ) 
    },
    error: { 
      bg: "bg-[#cc2d2d]", 
      icon: (
        <span className="inline-flex items-center justify-center border border-black bg-[#f87171] px-1 text-[10px] font-bold text-black rounded-sm shadow-[1px_1px_0px_#000] leading-none">
          ✕
        </span>
      ) 
    },
    warning: { 
      bg: "bg-[#d97706]", 
      icon: <span className="text-sm select-none">⚠️</span> 
    },
  };

  return (
    <div
      className={`
        ${theme[notification.type].bg} text-white px-5 py-3 rounded-xl shadow-md 
        flex justify-between items-center min-w-[260px] max-w-sm w-fit
        border border-white/10 transition-all duration-300 ease-in-out
        ${isExiting ? "opacity-0 -translate-y-4 scale-95" : "opacity-100 translate-x-0 scale-100 animate-slide-in"}
      `}
      style={{ pointerEvents: "auto" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 flex items-center justify-center">
          {theme[notification.type].icon}
        </div>
        {/* Ultra-concise white text content */}
        <span className="text-sm font-semibold tracking-wide text-white select-none">
          {notification.message}
        </span>
      </div>
      
      <button 
        onClick={handleManualClose} 
        className="ml-5 p-1 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white text-xs select-none"
      >
        ✕
      </button>
    </div>
  );
};

// ==========================================
// 3. MAIN PROVIDER (Wraps around all pages)
// ==========================================
export const NotificationProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const openNotification = (type: Notification["type"], message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotif: Notification = { id, type, message };
    setNotifications((prev) => [newNotif, ...prev]);
    return id; 
  };

  // Updates an active notification status/content using its ID
  const updateNotification = (id: string, type: Notification["type"], message: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, type, message } : notif))
    );
  };

  const closeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ openNotification, updateNotification, closeNotification }}>
      {children || <Outlet />} 

      {/* Positioned at the top right corner, below the header bar (top-24) */}
      <div 
        className="fixed top-24 right-5 z-[9999] flex flex-col items-end gap-2.5 pointer-events-none"
        style={{ maxWidth: "360px", width: "100%" }}
      >
        {notifications.map((notif) => (
          <NotificationItem
            key={notif.id}
            notification={notif}
            onClose={() => closeNotification(notif.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within a NotificationProvider!");
  return context;
};