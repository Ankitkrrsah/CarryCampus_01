
import React, { useEffect, useState } from "react";
import { useDeliveryStore } from "../store/deliveryStore";
import { Package, MapPin, ArrowRight, Trash2, Star, X } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import axios from 'axios';

const MyOrders = () => {
    const { myRequests, fetchMyRequests, submitReview, loading } = useDeliveryStore();
    const [reviewModal, setReviewModal] = useState({ show: false, orderId: null });
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const handleCancel = async (requestId) => {
        if (!confirm("Are you sure you want to cancel this request?")) return;
        try {
            await axios.patch(`/orders/${requestId}/cancel`);
            toast.success("Order Cancelled");
            fetchMyRequests(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const res = await submitReview({
            delivery_request_id: reviewModal.orderId,
            rating,
            comment
        });
        if (res.success) {
            setReviewModal({ show: false, orderId: null });
            setRating(5);
            setComment("");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">My Recent Requests</h1>

            <div className="space-y-4">
                {myRequests.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No requests found.</p>
                        <Link to="/create-request" className="text-indigo-600 font-bold mt-2 inline-block">Create One!</Link>
                    </div>
                ) : myRequests.map(order => (
                    <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative">

                        <div className="absolute top-5 right-5">
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                order.status === 'CANCELLED' ? 'bg-slate-100 text-slate-500' :
                                    order.status === 'OPEN' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {order.status}
                            </span>
                        </div>

                        <h3 className="font-bold text-slate-800 mb-1">{order.parcel_type} ({order.parcel_weight})</h3>
                        <p className="text-xs text-slate-500 mb-4">Posted on {new Date(order.created_at).toLocaleDateString()}</p>

                        <div className="flex flex-col gap-2 mb-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                <span><b>From:</b> {order.pickup_location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ArrowRight size={16} className="text-slate-400" />
                                <span><b>To:</b> {order.drop_location}</span>
                            </div>
                        </div>


                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                            <div className="text-xl font-bold text-slate-900">₹{order.reward_amount}</div>

                            {(order.status === 'OPEN' || order.status === 'ASSIGNED') && (
                                <button
                                    onClick={() => handleCancel(order.id)}
                                    className="p-2 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                                    title="Cancel Order"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            {order.status === 'DELIVERED' && !order.is_reviewed && (
                                <button
                                    onClick={() => setReviewModal({ show: true, orderId: order.id })}
                                    className="px-4 py-2 bg-amber-100 text-amber-700 font-bold rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
                                >
                                    <Star size={16} /> Rate Delivery
                                </button>
                            )}

                            {order.status === 'DELIVERED' && order.is_reviewed && (
                                <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> Rated
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>


            {reviewModal.show && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Rate Delivery Partner</h3>
                            <button onClick={() => setReviewModal({ show: false, orderId: null })}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleReviewSubmit} className="p-6">
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                                    >
                                        <Star size={32} fill="currentColor" />
                                    </button>
                                ))}
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comment</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 h-24 resize-none"
                                    placeholder="How was the delivery?"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">
                                Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;