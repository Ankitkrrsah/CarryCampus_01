
import React, { useEffect } from "react";
import { useDeliveryStore } from "../store/deliveryStore";
import { Package, MapPin, Phone, ArrowRight, CheckCircle, Truck } from "lucide-react";
import toast from "react-hot-toast";

const MyDeliveries = () => {
    const { myDeliveries, fetchMyDeliveries, updateDeliveryStatus, loading } = useDeliveryStore();

    useEffect(() => {
        fetchMyDeliveries();
    }, []);

    const handleStatusUpdate = async (requestId, status) => {
        if (confirm(`Are you sure you want to mark this as ${status}?`)) {
            await updateDeliveryStatus(requestId, status);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">My Deliveries</h1>

            <div className="space-y-4">
                {myDeliveries.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No active deliveries.</p>
                        <p className="text-sm">Go to "Find Orders" to pick one!</p>
                    </div>
                ) : myDeliveries.map(delivery => (
                    <div key={delivery.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800">{delivery.requester_name}</h3>
                                <a href={`tel:${delivery.requester_contact}`} className="flex items-center gap-1 text-sm text-indigo-600 font-medium">
                                    <Phone size={14} /> Call Requester
                                </a>
                            </div>
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${delivery.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                    delivery.status === 'PICKED' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {delivery.status}
                            </span>
                        </div>


                        <div className="flex flex-col gap-3 mb-5 pl-2 border-l-2 border-slate-100 ml-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                <span><b>Pickup:</b> {delivery.pickup_location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin size={16} className="text-rose-500" />
                                <span><b>Drop:</b> {delivery.drop_location}</span>
                            </div>
                        </div>


                        {delivery.status === 'ASSIGNED' && (
                            <button
                                disabled={loading}
                                onClick={() => handleStatusUpdate(delivery.id, 'PICKED')}
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-700"
                            >
                                <Truck size={18} /> Mark as Picked Up
                            </button>
                        )}

                        {delivery.status === 'PICKED' && (
                            <button
                                disabled={loading}
                                onClick={() => handleStatusUpdate(delivery.id, 'DELIVERED')}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700"
                            >
                                <CheckCircle size={18} /> Mark as Delivered
                            </button>
                        )}

                        {delivery.status === 'DELIVERED' && (
                            <div className="text-center text-sm text-green-600 font-medium py-2 bg-green-50 rounded-lg">
                                ✅ Completed on {new Date(delivery.completed_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyDeliveries;