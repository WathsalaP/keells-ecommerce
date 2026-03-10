import { createContext, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`; // ✅ unique
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const value = useMemo(() => ({ showNotification }), []);

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "grid", gap: 10 }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className="card"
            style={{
              padding: "12px 14px",
              minWidth: 260,
              borderLeft: n.type === "success" ? "6px solid var(--keells-green)" : "6px solid var(--error)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {n.type === "success" ? "Success" : "Error"}
            </div>
            <div style={{ color: "var(--text-muted)" }}>{n.message}</div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);