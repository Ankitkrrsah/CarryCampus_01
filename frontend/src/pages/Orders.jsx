
import React, { useEffect, useState } from "react";
import { useDeliveryStore } from "../store/deliveryStore";
import { MapPin, IndianRupee, Clock, ArrowRight, Filter, ChevronDown, SortAsc, SortDesc, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Orders = () => {
    const { openRequests, fetchOpenRequests, acceptRequest, loading } = useDeliveryStore();
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        min_reward: "",
        parcel_type: "",
        sortBy: "newest",
        order: "DESC",
        location: ""
    });

    useEffect(() => {
        fetchOpenRequests(filters);
    }, [filters]);

    const handleAccept = async (orderId) => {
        await acceptRequest(orderId);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const toggleOrder = () => {
        setFilters(prev => ({ ...prev, order: prev.order === 'ASC' ? 'DESC' : 'ASC' }));
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Review Requests</h1>
                        <p className="text-slate-500 text-xs">Find orders to earn money</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                        >
                            <Filter size={20} />
                        </button>
                        <Link to="/dashboard" className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 transition-colors">
                            <ArrowRight className="rotate-180" size={20} />
                        </Link>
                    </div>
                </div>


                <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-[500px] mb-6' : 'max-h-0'}`}>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50 space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Search Location</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-2 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="e.g. BH-1, Library..."
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                    className="w-full pl-8 pr-2 py-2 text-sm bg-slate-50 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Min Reward</label>
                                <div className="relative">
                                    <IndianRupee size={14} className="absolute left-2 top-2.5 text-slate-400" />
                                    <input
                                        type="number"
                                        name="min_reward"
                                        placeholder="0"
                                        value={filters.min_reward}
                                        onChange={handleFilterChange}
                                        className="w-full pl-7 pr-2 py-2 text-sm bg-slate-50 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Parcel Type</label>
                                <select
                                    name="parcel_type"
                                    value={filters.parcel_type}
                                    onChange={handleFilterChange}
                                    className="w-full px-2 py-2 text-sm bg-slate-50 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-semibold appearance-none"
                                >
                                    <option value="">All Types</option>
                                    <option value="Food">Food</option>
                                    <option value="Documents">Docs</option>
                                    <option value="Electronics">Tech</option>
                                    <option value="Essentials">Daily</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sort By</label>
                                <select
                                    name="sortBy"
                                    value={filters.sortBy}
                                    onChange={handleFilterChange}
                                    className="w-full px-2 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg outline-none font-bold"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="reward">Highest Reward</option>
                                    <option value="time">Delivery Time</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={toggleOrder}
                                    className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                                    title={filters.order === 'ASC' ? 'Ascending' : 'Descending'}
                                >
                                    {filters.order === 'ASC' ? <SortAsc size={20} /> : <SortDesc size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setFilters({ min_reward: "", parcel_type: "", sortBy: "newest", order: "DESC", location: "" })}
                            className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 animate-pulse">Loading orders...</div>
                    ) : openRequests.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                            <div className="text-slate-300 mb-2 flex justify-center"><Filter size={40} /></div>
                            <p className="text-slate-400 font-medium">No orders match your filters.</p>
                            <button onClick={() => setFilters({ min_reward: "", parcel_type: "", sortBy: "newest", order: "DESC", location: "" })} className="text-indigo-600 text-sm font-bold mt-2">Clear all</button>
                        </div>
                    ) : openRequests.map(order => (
                        <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
                                        {order.requester_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{order.requester_name}</h3>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                            <Clock size={10} /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black text-sm flex items-center shadow-sm">
                                    <IndianRupee size={14} />{order.reward_amount}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mb-5 pl-4 border-l-2 border-slate-100 ml-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                                    <span>From: <b className="text-slate-800">{order.pickup_location}</b></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                                    <span>To: <b className="text-slate-800">{order.drop_location}</b></span>
                                </div>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{order.parcel_type}</span>
                                    <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{order.parcel_weight}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAccept(order.id)}
                                className="w-full py-3 bg-slate-900 group-hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-slate-100 transition-all active:scale-[0.98]"
                            >
                                Accept Order
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;