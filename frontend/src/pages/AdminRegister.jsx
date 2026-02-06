
import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldAlert } from "lucide-react";

const AdminRegister = () => {
    const navigate = useNavigate();
    const { registerAdmin, loading } = useAuthStore();

    const [formData, setFormData] = useState({
        name: "",
        roll_number: "",
        institute_email: "",
        mobile_number: "",
        room_number: "ADMIN",
        password: "",
        admin_secret: ""
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await registerAdmin(formData);
        if (result.success) {
            toast.success(result.message);
            navigate("/");
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-rose-600"></div>

                <div className="flex flex-col items-center mb-6">
                    <ShieldAlert size={48} className="text-rose-600 mb-2" />
                    <h1 className="text-2xl font-bold text-slate-800">Admin Access</h1>
                    <p className="text-slate-500 text-sm">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="name" placeholder="Full Name" onChange={handleChange} className="input-field" required />
                        <input name="roll_number" placeholder="Roll / ID Number" onChange={handleChange} className="input-field" required />
                    </div>

                    <input name="institute_email" type="email" placeholder="Institute Email" onChange={handleChange} className="input-field w-full" required />
                    <input name="mobile_number" placeholder="Mobile Number" onChange={handleChange} className="input-field w-full" required />

                    <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input-field w-full" required />

                    <div className="pt-2 border-t border-slate-100">
                        <label className="text-xs font-bold text-rose-600 uppercase mb-1 block">Security Clearance</label>
                        <input
                            name="admin_secret"
                            type="password"
                            placeholder="Enter Admin Secret Key"
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-rose-100 rounded-lg focus:border-rose-500 outline-none bg-rose-50 placeholder-rose-200 text-rose-800 font-mono"
                            required
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 mt-4 disabled:opacity-70"
                    >
                        {loading ? "Verifying..." : "Register Admin"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-slate-400 text-sm hover:text-slate-600">Return to Login</Link>
                </div>
            </div>

            <style>{`
                .input-field {
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .input-field:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
                }
            `}</style>
        </div>
    );
};

export default AdminRegister;