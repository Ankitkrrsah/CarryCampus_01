
import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const VerifyEmail = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            toast.error("Invalid access");
            navigate("/register");
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("/auth/verify-email", { email, otp });
            toast.success("Email Verified! Please Login.");
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await axios.post("/auth/resend-otp", { email });
            toast.success("OTP Resent!");
        } catch (error) {
            toast.error("Failed to resend OTP");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify Email</h2>
                <p className="text-slate-500 mb-6">Enter the OTP sent to <b>{email}</b></p>

                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        maxLength="6"
                        placeholder="123456"
                        className="w-full text-center text-3xl tracking-[1em] font-bold p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <button
                    onClick={handleResend}
                    className="mt-4 text-sm text-indigo-600 font-semibold hover:underline"
                >
                    Resend OTP
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;