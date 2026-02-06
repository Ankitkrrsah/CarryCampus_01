
import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await login(email, password);

        if (result.success) {
            toast.success("Welcome back!");
            navigate("/dashboard");
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-xl w-96 border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600">CarryCampus</h1>
                    <p className="text-slate-400 mt-2">Login to continue</p>
                </div>

                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Institute Email"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        readOnly
                        onFocus={(e) => e.target.removeAttribute('readOnly')}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        readOnly
                        onFocus={(e) => e.target.removeAttribute('readOnly')}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-3 font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-slate-600">
                    New here? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Create Account</Link>
                </div>
                <div className="mt-2 text-center text-sm">
                    <Link to="/forgot-password" className="text-slate-400 hover:text-slate-600">Forgot Password?</Link>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                    <Link to="/admin/register" className="text-xs font-bold text-slate-300 hover:text-indigo-500 transition-colors">
                        Admin Access
                    </Link>
                </div>
            </form>
        </div>
    );
};
export default Login;