
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const { forgotPassword, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await forgotPassword(email);

        if (result.success) {
            toast.success(result.message);
            navigate("/reset-password", { state: { email } });
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="p-8 bg-white rounded-xl shadow-xl w-96 border border-slate-100">
                <h2 className="mb-4 text-2xl font-bold text-center text-slate-800">Forgot Password</h2>
                <p className="mb-6 text-sm text-center text-slate-500">
                    Enter your registered email to receive an OTP.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Institute Email"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-3 font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link to="/" className="text-sm text-slate-400 hover:text-slate-600">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;