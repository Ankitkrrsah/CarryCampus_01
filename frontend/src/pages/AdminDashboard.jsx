

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, ShieldCheck, Users, Trash2, Star, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [verifiedUsers, setVerifiedUsers] = useState([]);
    const [generalUsers, setGeneralUsers] = useState([]);
    const [view, setView] = useState("pending"); 
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
            toast.error("Access Denied");
            navigate("/dashboard");
            return;
        }
        fetchAllData();
    }, [user, navigate]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [pendingRes, verifiedRes, generalRes] = await Promise.all([
                axios.get("/admin/pending"),
                axios.get("/admin/verified"),
                axios.get("/admin/students")
            ]);
            setPendingUsers(pendingRes.data.data);
            setVerifiedUsers(verifiedRes.data.data);
            setGeneralUsers(generalRes.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId, status) => {
        if (!confirm(`Are you sure you want to ${status} this user?`)) return;
        try {
            await axios.patch("/admin/verify", { userId, status });
            toast.success(`User ${status} successfully`);
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            if (status === 'approved') fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm("Are you sure you want to PERMANENTLY DELETE this user? This cannot be undone.")) return;
        try {
            await axios.delete(`/admin/users/${userId}`);
            toast.success("User deleted successfully");
            setVerifiedUsers(prev => prev.filter(u => u.id !== userId));
            setGeneralUsers(prev => prev.filter(u => u.id !== userId)); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    if (loading && pendingUsers.length === 0 && verifiedUsers.length === 0 && generalUsers.length === 0) return <div className="text-center py-10">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-rose-600 w-8 h-8" />
                    <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
                </div>
                <button onClick={logout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600">
                    <LogOut size={16} /> Logout
                </button>
            </div>


            <div className="grid grid-cols-3 gap-4 mb-8">
                <div
                    onClick={() => setView('pending')}
                    className={`p-4 rounded-xl shadow-sm border cursor-pointer transition-all ${view === 'pending' ? 'bg-white border-rose-500 ring-1 ring-rose-500' : 'bg-slate-100 border-transparent hover:bg-white'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xl font-bold text-slate-800">{pendingUsers.length}</span>
                    </div>
                    <h3 className="font-semibold text-slate-600 text-sm">Requests</h3>
                </div>

                <div
                    onClick={() => setView('verified')}
                    className={`p-4 rounded-xl shadow-sm border cursor-pointer transition-all ${view === 'verified' ? 'bg-white border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-100 border-transparent hover:bg-white'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <span className="text-xl font-bold text-slate-800">{verifiedUsers.length}</span>
                    </div>
                    <h3 className="font-semibold text-slate-600 text-sm">Delivery Partners</h3>
                </div>

                <div onClick={() => setView('students')} className={`p-4 rounded-xl shadow-sm border cursor-pointer transition-all ${view === 'students' ? 'bg-white border-blue-500 ring-1 ring-blue-500' : 'bg-slate-100 border-transparent hover:bg-white'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users size={20} /></div>
                        <span className="text-xl font-bold text-slate-800">{generalUsers.length}</span>
                    </div>
                    <h3 className="font-semibold text-slate-600 text-sm">All Students</h3>
                </div>
            </div>

            <h2 className="text-lg font-semibold text-slate-700 mb-4 capitalize">
                {view === 'pending' ? 'Verification Queue' : view === 'verified' ? 'Delivery Partners' : 'General Students'}
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {view === 'pending' ? (
                    pendingUsers.length === 0 ? (
                        <p className="text-slate-400 col-span-full text-center py-8">No pending requests.</p>
                    ) : (
                        pendingUsers.map(u => (
                            <div key={u.id} className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                                <div className="flex gap-4 mb-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                        <img src={u.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{u.name}</h3>
                                        <p className="text-sm text-slate-500">{u.roll_number}</p>
                                        <p className="text-xs text-indigo-500 break-all">{u.institute_email}</p>
                                    </div>
                                </div>
                                {u.id_card_url && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">ID Card Proof</p>
                                        <a href={u.id_card_url} target="_blank" rel="noreferrer" className="block h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                            <img src={u.id_card_url} alt="ID Card" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                        </a>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button onClick={() => handleVerify(u.id, 'rejected')} className="flex-1 py-2 bg-rose-50 text-rose-600 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-rose-100">
                                        <XCircle size={18} /> Reject
                                    </button>
                                    <button onClick={() => handleVerify(u.id, 'approved')} className="flex-1 py-2 bg-green-50 text-green-600 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-green-100">
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                </div>
                            </div>
                        ))
                    )
                ) : view === 'verified' ? (
                    verifiedUsers.length === 0 ? (
                        <p className="text-slate-400 col-span-full text-center py-8">No verified users yet.</p>
                    ) : (
                        verifiedUsers.map(u => (
                            <div key={u.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                        <img src={u.selfie_url || `https://ui-avatars.com/api/?name=${u.name}`} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{u.name}</h3>
                                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                            <Star size={14} fill="currentColor" />
                                            <span className="font-medium">{parseFloat(u.rating || 0).toFixed(1)}</span>
                                            <span className="text-slate-400 text-xs">({u.rating_count || 0} reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 mb-6 flex-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Roll No:</span>
                                        <span className="font-mono">{u.roll_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Email:</span>
                                        <span className="truncate max-w-[150px]" title={u.institute_email}>{u.institute_email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Mobile:</span>
                                        <span>{u.mobile_number}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(u.id)}
                                    className="w-full py-2 bg-red-50 text-red-600 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={16} /> Delete User
                                </button>
                            </div>
                        ))
                    )
                ) : (
                    view === 'students' && (
                        generalUsers.length === 0 ? (
                            <p className="text-slate-400 col-span-full text-center py-8">No general students found.</p>
                        ) : (
                            generalUsers.map(u => (
                                <div key={u.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl">
                                            {u.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{u.name}</h3>
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Student</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-600 mb-6 flex-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Roll No:</span>
                                            <span className="font-mono">{u.roll_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Email:</span>
                                            <span className="truncate max-w-[150px]" title={u.institute_email}>{u.institute_email}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="w-full py-2 bg-transparent text-red-500 text-xs font-semibold hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Remove User
                                    </button>
                                </div>
                            ))
                        )
                    )
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
