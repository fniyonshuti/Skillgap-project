import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  async function load() {
    const { data } = await api.get("/notifications");
    setNotifications(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    await api.patch(`/notifications/${id}/read`);
    load();
  }

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <h2>Notifications</h2>
          <p>System messages and assessment updates.</p>
        </div>
      </div>

      <div className="notification-list">
        {notifications.map((notification) => (
          <article key={notification._id} className={`notification-card ${notification.isRead ? "read" : ""}`}>
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </div>
            {!notification.isRead && (
              <button className="secondary-button" type="button" onClick={() => markRead(notification._id)}>
                Mark read
              </button>
            )}
          </article>
        ))}
        {!notifications.length && <div className="panel">No notifications yet.</div>}
      </div>
    </div>
  );
}
