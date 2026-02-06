

import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";

const ChangePassword = () => {
    const { changePassword, loading } = useAuthStore();

    const [passData, setPassData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setPassData({ ...passData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passData.newPassword !== passData.confirmPassword) {
            return toast.error("New passwords do not match");
        }

        const result = await changePassword({
            oldPassword: passData.oldPassword,
            newPassword: passData.newPassword
        });

        if (result.success) {
            toast.success(result.message);
            setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-start pt-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
                <div className="flex items-center gap-3 mb-6 text-slate-800">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Change Password</h1>
                        <p className="text-slate-500 text-sm">Update your account security</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            name="oldPassword"
                            value={passData.oldPassword}
                            onChange={handleChange}
                            placeholder="Enter current password"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passData.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 mt-4"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
