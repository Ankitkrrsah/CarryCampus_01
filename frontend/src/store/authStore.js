
import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';
axios.defaults.baseURL = "http://localhost:8000/api/v1";
axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: (() => {
        try {
            const item = localStorage.getItem("user");
            return item && item !== "undefined" ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    })(),
    isAuthenticated: (() => {
        try {
            const item = localStorage.getItem("user");
            return !!(item && item !== "undefined" && JSON.parse(item));
        } catch {
            return false;
        }
    })(),
    loading: false,
    checkingAuth: true,

    login: async (email, password) => {
        set({ loading: true });
        try {
            const res = await axios.post("/auth/login", { email, password });
            const user = res.data.data.user;

            localStorage.setItem("user", JSON.stringify(user));
            set({ user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            set({ loading: false });
            const message = error.response?.data?.message || "Login failed";
            return { success: false, message };
        }
    },

    register: async (formData) => {
        set({ loading: true });
        try {
            const res = await axios.post("/auth/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            set({ loading: false });
            return { success: true, message: "Registration successful! Please login." };
        } catch (error) {
            set({ loading: false });
            const message = error.response?.data?.message || "Registration failed";
            return { success: false, message };
        }
    },

    registerAdmin: async (data) => {
        set({ loading: true });
        try {
            await axios.post("/auth/register-admin", data);
            set({ loading: false });
            return { success: true, message: "Admin registered! Please Login." };
        } catch (error) {
            set({ loading: false });
            return { success: false, message: error.response?.data?.message || "Admin Registration Failed" };
        }
    },

    logout: async () => {
        try {
            await axios.post("/auth/logout");
        } catch (error) {
            console.error("Logout failed", error);
        }
        localStorage.removeItem("user");
        set({ user: null, isAuthenticated: false });
        toast.success("Logged out successfully");
    },

    forgotPassword: async (email) => {
        set({ loading: true });
        try {
            await axios.post("/auth/forgot-password", { email });
            set({ loading: false });
            return { success: true, message: "OTP sent to email" };
        } catch (error) {
            set({ loading: false });
            return { success: false, message: error.response?.data?.message || "Failed to send OTP" };
        }
    },

    verifyOtp: async (email, otp) => {
        set({ loading: true });
        try {
            await axios.post("/auth/verify-otp", { email, otp });
            set({ loading: false });
            return { success: true, message: "OTP Verified" };
        } catch (error) {
            set({ loading: false });
            return { success: false, message: error.response?.data?.message || "Invalid OTP" };
        }
    },

    resetPassword: async (data) => {
        set({ loading: true });
        try {
            await axios.post("/auth/reset-password", data);
            set({ loading: false });
            return { success: true, message: "Password reset successfully" };
        } catch (error) {
            set({ loading: false });
            return { success: false, message: error.response?.data?.message || "Reset failed" };
        }
    },

    changePassword: async (data) => {
        set({ loading: true });
        try {
            await axios.post("/auth/change-password", data);
            set({ loading: false });
            return { success: true, message: "Password updated successfully" };
        } catch (error) {
            set({ loading: false });
            return { success: false, message: error.response?.data?.message || "Update failed" };
        }
    },

    requestVerification: async (formData) => {
        set({ loading: true });
        try {
            const res = await axios.post("/auth/request-verification", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });


            const updatedUser = res.data.data;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            set({ user: updatedUser, loading: false });

            return { success: true, message: "Verification submitted successfully!" };
        } catch (error) {
            set({ loading: false });
            return { success: false, message: error.response?.data?.message || "Submission failed" };
        }
    },


    checkingAuth: true,



    checkAuth: async () => {
        try {
            const res = await axios.get("/auth/me");
            const user = res.data.data;
            localStorage.setItem("user", JSON.stringify(user));
            set({ user, isAuthenticated: true, checkingAuth: false });
        } catch (error) {
            set({ user: null, isAuthenticated: false, checkingAuth: false });
            localStorage.removeItem("user");
        }
    }
}));