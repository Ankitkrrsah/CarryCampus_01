
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp, resetPassword, loading } = useAuthStore();

    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const result = await verifyOtp(email, otp);
        if (result.success) {
            toast.success("OTP Verified! Set your new password.");
            setStep(2);
        } else {
            toast.error(result.message);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        const result = await resetPassword({ email, otp, newPassword });

        if (result.success) {
            toast.success(result.message);
            navigate("/");
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="p-8 bg-white rounded-xl shadow-xl w-96 border border-slate-100">
                <h2 className="mb-4 text-2xl font-bold text-center text-slate-800">
                    {step === 1 ? "Verify OTP" : "Reset Password"}
                </h2>

                {step === 1 ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Institute Email"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={!!location.state?.email}
                        />
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none tracking-widest text-center font-bold"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full p-3 font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify & Proceed"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full p-3 font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Set New Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;