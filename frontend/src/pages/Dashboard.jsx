import React from "react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import { PlusSquare, Search } from "lucide-react";
import toast from "react-hot-toast";
import AdminDashboard from "./AdminDashboard";

const Dashboard = () => {
    const { user, logout } = useAuthStore();


    if (user?.role === 'ADMIN' || user?.role === 'admin') {
        return <AdminDashboard />;
    }

    const handleEarnClick = (e) => {


        if (user?.is_verified) {

            return;
        }


        e.preventDefault();

        if (user?.verification_status === 'pending') {
            toast('Verification Pending. Please wait for approval.', { icon: '⏳' });
        } else {
            toast.error("You must verify your ID to earn money!");

        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Hi, {user?.name?.split(' ')[0]} 👋</h1>
                        <p className="text-slate-500 text-sm">What would you like to do?</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100"
                    >
                        Logout
                    </button>
                </div>

                <div className="space-y-6">

                    <Link to="/create-request" className="block relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl shadow-xl shadow-indigo-200 text-white group">
                        <div className="relative z-10">
                            <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 text-white">
                                <PlusSquare size={28} />
                            </div>
                            <h2 className="text-2xl font-bold mb-1">Send a Package</h2>
                            <p className="text-indigo-100 text-sm mb-4">Request a delivery from anywhere.</p>
                            <div className="inline-block bg-white text-indigo-700 font-bold px-4 py-2 rounded-lg text-sm group-hover:scale-105 transition-transform">
                                Create Request
                            </div>
                        </div>
                    </Link>


                    {user?.is_verified ? (
                        <Link to="/orders" className="block relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border border-slate-100 group">
                            <div className="relative z-10">
                                <div className="bg-green-100 w-fit p-3 rounded-xl mb-4 text-green-600">
                                    <Search size={28} />
                                </div>
                                <h2 className="text-2xl font-bold mb-1 text-slate-800">Earn Money</h2>
                                <p className="text-slate-500 text-sm mb-4">Find tasks and deliver parcels.</p>
                                <div className="inline-block bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-sm group-hover:scale-105 transition-transform">
                                    Find Orders
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div className="block relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border border-slate-100 group opacity-75">
                            <div className="relative z-10">
                                <div className="bg-slate-100 w-fit p-3 rounded-xl mb-4 text-slate-500">
                                    <Search size={28} />
                                </div>
                                <h2 className="text-2xl font-bold mb-1 text-slate-800">Earn Money</h2>
                                <p className="text-rose-500 text-sm mb-4 font-medium">⚠️ Verification Required</p>

                                {user?.verification_status === 'pending' ? (
                                    <button className="inline-block bg-slate-200 text-slate-500 font-bold px-4 py-2 rounded-lg text-sm cursor-not-allowed">
                                        Pending Approval
                                    </button>
                                ) : (
                                    <Link to="/verification" className="inline-block bg-rose-500 text-white font-bold px-4 py-2 rounded-lg text-sm hover:shadow-lg hover:shadow-rose-200 transition-all">
                                        Verify Now
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-8 flex justify-center gap-6 text-sm font-semibold">
                    <Link to="/my-orders" className="text-slate-600 hover:text-indigo-600 flex items-center gap-1">
                        📦 My Requests
                    </Link>

                    {user?.is_verified && (
                        <Link to="/my-deliveries" className="text-slate-600 hover:text-indigo-600 flex items-center gap-1">
                            🚚 My Deliveries
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;