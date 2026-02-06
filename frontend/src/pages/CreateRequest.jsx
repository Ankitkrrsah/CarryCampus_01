import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Package, Clock, IndianRupee } from "lucide-react";
import { useDeliveryStore } from "../store/deliveryStore";

const CreateRequest = () => {
    const navigate = useNavigate();
    const { createRequest, loading } = useDeliveryStore();

    const [formData, setFormData] = useState({
        drop_location: "",
        pickup_location: "Main Gate",
        reward_amount: "20",
        parcel_weight: "Light (0-2kg)",
        parcel_type: "Food",
        expected_time: ""
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createRequest(formData, navigate);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
                    <button onClick={() => navigate(-1)}><ArrowLeft /></button>
                    <h1 className="text-xl font-bold">New Delivery Request</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    <div className="relative pl-6 border-l-2 border-indigo-100 space-y-8">
                        <div className="relative">
                            <span className="absolute -left-[31px] bg-indigo-100 text-indigo-600 p-1 rounded-full"><MapPin size={16} /></span>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Pickup Location</label>
                            <select
                                name="pickup_location"
                                value={formData.pickup_location}
                                onChange={handleChange}
                                className="w-full mt-1 font-semibold bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none pb-2"
                            >
                                <option>Main Gate</option>
                                <option>Admin Block</option>
                                <option>Canteen</option>
                                <option>Library</option>
                            </select>
                        </div>

                        <div className="relative">
                            <span className="absolute -left-[31px] bg-rose-100 text-rose-600 p-1 rounded-full"><MapPin size={16} /></span>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Drop Location</label>
                            <input
                                name="drop_location"
                                placeholder="e.g. BH-1 Room 102"
                                onChange={handleChange}
                                className="w-full mt-1 font-semibold bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none pb-2"
                                required
                            />
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm">
                                <Package size={16} /> Parcel Type
                            </div>
                            <select name="parcel_type" onChange={handleChange} className="w-full bg-transparent font-semibold outline-none">
                                <option>Food</option>
                                <option>Documents</option>
                                <option>Electronics</option>
                                <option>Essentials</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm">
                                <Package size={16} /> Weight
                            </div>
                            <select name="parcel_weight" onChange={handleChange} className="w-full bg-transparent font-semibold outline-none">
                                <option>Light (0-2kg)</option>
                                <option>Medium (2-5kg)</option>
                                <option>Heavy (5kg+)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm">
                            <Clock size={16} /> Expected Time
                        </div>
                        <input
                            name="expected_time"
                            type="time"
                            onChange={handleChange}
                            className="w-full bg-transparent font-semibold outline-none"
                            required
                        />
                    </div>


                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Offer Reward</label>
                        <div className="flex items-center text-3xl font-bold text-indigo-700">
                            <IndianRupee size={24} />
                            <input
                                name="reward_amount"
                                type="number"
                                min="10"
                                max="100"
                                value={formData.reward_amount}
                                onChange={handleChange}
                                className="bg-transparent w-full outline-none"
                            />
                        </div>
                        <p className="text-xs text-indigo-400 mt-1">Min: ₹10 • Max: ₹100</p>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {loading ? "Posting..." : "Post Request"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRequest;