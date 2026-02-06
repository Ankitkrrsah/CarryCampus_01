
import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const useDeliveryStore = create((set) => ({
    openRequests: [],
    myRequests: [],
    loading: false,

    createRequest: async (data, navigate) => {
        set({ loading: true });
        try {
            await axios.post("/orders/request", data);
            toast.success("Request processed! Waiting for a carrier...");
            set({ loading: false });
            navigate("/dashboard");
            return { success: true };
        } catch (error) {
            set({ loading: false });
            const message = error.response?.data?.message || "Failed to create request";
            toast.error(message);
            return { success: false, message };
        }
    },

    fetchOpenRequests: async (filters = {}) => {
        set({ loading: true });
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const res = await axios.get(`/orders/open?${queryParams}`);
            set({ openRequests: res.data.data, loading: false });
        } catch (error) {
            console.error("Fetch error", error);
            set({ loading: false });
        }
    },

    fetchMyRequests: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/orders/my-requests");
            set({ myRequests: res.data.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    acceptRequest: async (requestId) => {
        try {
            await axios.patch(`/orders/${requestId}/accept`);
            toast.success("Order Accepted! Go to My Deliveries.");
            const res = await axios.get("/orders/open");
            set({ openRequests: res.data.data });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || "Failed to accept";
            toast.error(message);
            return { success: false, message };
        }
    },

    myDeliveries: [],

    fetchMyDeliveries: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/orders/my-deliveries");
            set({ myDeliveries: res.data.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    updateDeliveryStatus: async (requestId, status) => {
        set({ loading: true });
        try {
            const res = await axios.patch(`/orders/${requestId}/status`, { status });
            toast.success(`Order Updated: ${status}`);


            set(state => ({
                myDeliveries: state.myDeliveries.map(d =>
                    d.id === requestId ? { ...d, status: res.data.data.status, completed_at: res.data.data.completed_at || d.completed_at } : d
                ),
                loading: false
            }));
            return { success: true };
        } catch (error) {
            set({ loading: false });
            toast.error("Failed to update status");
            return { success: false };
        }
    },

    submitReview: async (data) => {
        set({ loading: true });
        try {
            await axios.post("/reviews", data);
            toast.success("Review Submitted! ⭐");


            set(state => ({
                myRequests: state.myRequests.map(r =>
                    r.id === data.delivery_request_id ? { ...r, is_reviewed: true } : r
                ),
                loading: false
            }));
            return { success: true };
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to submit review");
            return { success: false };
        }
    }
}));