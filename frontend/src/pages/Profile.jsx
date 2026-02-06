
import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Wallet, Star, History, Package, Lock } from "lucide-react";
import { cn } from "../utils/cn";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const Profile = () => {
    const { user, changePassword } = useAuthStore();
    const [wallet, setWallet] = useState({ balance: 0, total_earnings: 0 });
    const [reviews, setReviews] = useState({ average_rating: 0, count: 0 });
    const [activeTab, setActiveTab] = useState("stats"); 


    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            return toast.error("New passwords do not match");
        }
        const result = await changePassword({
            oldPassword: passData.oldPassword,
            newPassword: passData.newPassword
        });
        if (result.success) {
            toast.success(result.message);
            setShowPasswordModal(false);
            setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } else {
            toast.error(result.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, ReviewRes] = await Promise.all([
                    axios.get("/transactions/balance"),
                    axios.get(`/reviews/user/${user.id}`)
                ]);
                setWallet(walletRes.data.data);
                setReviews(ReviewRes.data);
            } catch (error) {
                console.error("Failed to fetch profile data");
            }
        };
        fetchData();
    }, [user.id]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">

            <div className="flex items-center gap-4 mb-8">
                <div className="h-16 w-16 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img src={user.selfie_url} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
                    <p className="text-slate-500 text-sm">Roll No: {user.roll_number}</p>
                </div>
            </div>


            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Wallet Balance</p>
                        <h2 className="text-4xl font-bold">₹{wallet.balance}</h2>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg">
                        <Wallet className="text-emerald-400" />
                    </div>
                </div>
                <div className="mt-6 flex gap-8">
                    <div>
                        <p className="text-slate-500 text-xs">Total Earnings</p>
                        <p className="font-semibold text-emerald-400">+₹{wallet.total_earnings}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs">Rating</p>
                        <div className="flex items-center gap-1 font-semibold text-amber-400">
                            <Star size={14} fill="currentColor" /> {reviews.average_rating}
                        </div>
                    </div>
                </div>
            </div>


            <div className="flex p-1 bg-white rounded-xl shadow-sm mb-6">
                <button
                    onClick={() => setActiveTab("stats")}
                    className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", activeTab === "stats" ? "bg-indigo-50 text-indigo-600" : "text-slate-400")}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", activeTab === "history" ? "bg-indigo-50 text-indigo-600" : "text-slate-400")}
                >
                    History
                </button>
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", activeTab === "reviews" ? "bg-indigo-50 text-indigo-600" : "text-slate-400")}
                >
                    Reviews
                </button>
            </div>

            {activeTab === 'stats' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Account Details</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">Email</span>
                            <span className="font-medium text-slate-800">{user.institute_email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">Room</span>
                            <span className="font-medium text-slate-800">{user.room_number}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">Mobile</span>
                            <span className="font-medium text-slate-800">{user.mobile_number}</span>
                        </div>

                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full mt-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Lock size={18} /> Change Password
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Transaction History</h3>
                    <TransactionHistory />
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Reviews & Ratings</h3>
                    {reviews.count === 0 ? (
                        <div className="text-center py-8 text-slate-400">No reviews yet</div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.data?.map(review => (
                                <div key={review.id} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                                {review.reviewer_image ? (
                                                    <img src={review.reviewer_image} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{review.reviewer_name?.[0]}</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{review.reviewer_name}</p>
                                                <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                                            <Star size={12} fill="currentColor" /> {review.rating}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm italic">"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}



            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Change Password</h3>
                        <form onSubmit={handlePasswordChange} className="space-y-3">
                            <input
                                type="password"
                                placeholder="Old Password"
                                className="w-full p-3 border rounded-lg outline-none focus:border-indigo-500"
                                value={passData.oldPassword}
                                onChange={e => setPassData({ ...passData, oldPassword: e.target.value })}
                                required
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                className="w-full p-3 border rounded-lg outline-none focus:border-indigo-500"
                                value={passData.newPassword}
                                onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                            <input
                                type="password"
                                placeholder="Confirm new Password"
                                className="w-full p-3 border rounded-lg outline-none focus:border-indigo-500"
                                value={passData.confirmPassword}
                                onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })}
                                required
                            />
                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get("/transactions");
                setTransactions(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="text-center py-4">Loading...</div>;

    if (transactions.length === 0) {
        return <div className="text-center py-8 text-slate-400">No transactions yet</div>;
    }

    return (
        <div className="space-y-3">
            {transactions.map((t) => {
                const isCredit = t.paid_to === user.id;
                return (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                                {isCredit ? '+' : '-'}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">
                                    {isCredit ? `Received from ${t.paid_by_name}` : `Paid to ${t.paid_to_name}`}
                                </p>
                                <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className={`font-bold ${isCredit ? 'text-green-600' : 'text-slate-900'}`}>
                            {isCredit ? '+' : '-'}₹{t.amount}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Profile;