import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../services/api.js";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <h2>Notifications</h2>
          <p>System messages and assessment updates.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

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
