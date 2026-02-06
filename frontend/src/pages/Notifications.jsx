
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get("/notifications");
            setNotifications(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.patch("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success("All marked as read");
        } catch (error) {
            toast.error("Failed to update");
        }
    };

    if (loading) return <div className="p-4 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
                <button onClick={markAllRead} className="text-indigo-600 text-sm font-bold hover:underline">Mark all read</button>
            </div>

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} className={`p-4 rounded-xl border ${n.is_read ? 'bg-white border-slate-100' : 'bg-indigo-50 border-indigo-100'}`}>
                            <div className="flex gap-3">
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.is_read ? 'bg-slate-300' : 'bg-indigo-500'}`}></div>
                                <div>
                                    <p className={`text-sm ${n.is_read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>{n.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;