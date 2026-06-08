// src/components/NotificationBell.jsx
import React, { useEffect, useState } from "react";
import { fetchNotifications, markNotifications, initPush } from "../notifications";

// Simple bell SVG icon
function BellIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C10.8954 2 10 2.89543 10 4V5.07048C7.16704 5.55799 5 8.03618 5 11V15L3 17V18H21V17L19 15V11C19 8.03618 16.8329 5.55799 14 5.07048V4C14 2.89543 13.1046 2 12 2Z" />
      <path d="M13 22C13 23.1046 12.1046 24 11 24C9.89543 24 9 23.1046 9 22H13Z" />
    </svg>
  );
}

export default function NotificationBell({ userId, role }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Initialize push subscription on mount
  useEffect(() => {
    initPush(userId, role).catch(console.error);
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRead = async (id) => {
    await markNotifications([id], true);
    loadNotifications();
  };

  const statusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="relative" id="notification-root">
      <button
        className="relative text-white hover:opacity-90 transition"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-fade-in">
          <div className="p-4 border-b border-gray-100 font-semibold text-gray-800">Notifications</div>
          <ul className="max-h-60 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="flex items-start px-4 py-2 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => toggleRead(n.id)}
              >
                <span className={`w-2 h-2 rounded-full mt-1 ${statusColor(n.status)} mr-2`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800 break-words">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.timestamp).toLocaleString()}{n.remarks && ` • ${n.remarks}`}
                  </p>
                </div>
                {role === 'approver' && n.status.toLowerCase() === 'pending' && (
                  <div className="flex space-x-2 ml-2">
                    <button
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetch('/api/requests/action', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ requestId: n.id, action: 'approve', approverId: userId })
                        }).then(() => toggleRead(n.id));
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetch('/api/requests/action', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ requestId: n.id, action: 'reject', approverId: userId })
                        }).then(() => toggleRead(n.id));
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
            {notifications.length === 0 && (
              <li className="p-4 text-center text-gray-500">No notifications</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
