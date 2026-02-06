import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, Upload } from "lucide-react";

const Register = () => {
    const navigate = useNavigate();
    const { register, loading } = useAuthStore();
    const [formData, setFormData] = useState({
        name: "",
        roll_number: "",
        institute_email: "",
        mobile_number: "",
        room_number: "",
        password: "",
        selfie: null
    });
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, selfie: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        const result = await register(data);

        if (result.success) {
            toast.success(result.message);
            navigate("/verify-email", { state: { email: formData.institute_email } });
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 py-12">
            <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-xl w-full max-w-md">
                <h2 className="mb-2 text-3xl font-bold text-center text-slate-800">Join CarryCampus</h2>
                <p className="mb-6 text-center text-slate-500">Earn money or get things delivered.</p>

                <div className="space-y-4">

                    <div className="flex justify-center mb-6">
                        <div className="relative w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-indigo-300">
                            {preview ? (
                                <img src={preview} alt="Selfie" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="text-slate-400" size={32} />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                required
                            />
                        </div>
                        <p className="absolute mt-24 text-xs text-slate-400">Upload Selfie</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        <input name="roll_number" placeholder="Roll Number" onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>

                    <input name="institute_email" type="email" placeholder="Institute Email" onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />

                    <div className="grid grid-cols-2 gap-4">
                        <input name="mobile_number" placeholder="Mobile Number" onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        <input name="room_number" placeholder="Room Number" onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>

                    <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-4 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-slate-600">
                    Already have an account? <Link to="/" className="text-indigo-600 font-semibold hover:underline">Login</Link>
                </div>
            </form>
        </div>
    );
};
export default Register;