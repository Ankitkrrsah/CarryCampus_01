
import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Upload, CheckCircle, AlertCircle, Camera, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VerificationRequest = () => {
    const { user, requestVerification, loading } = useAuthStore();
    const navigate = useNavigate();

    const [idCard, setIdCard] = useState(null);
    const [selfie, setSelfie] = useState(null);
    const [previewId, setPreviewId] = useState(null);
    const [previewSelfie, setPreviewSelfie] = useState(null);

    const handleFileChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idCard) {
            return toast.error("Please upload your ID Card");
        }

        const formData = new FormData();
        formData.append("id_card", idCard);
        if (selfie) {
            formData.append("selfie", selfie);
        }

        const result = await requestVerification(formData);
        if (result.success) {
            toast.success(result.message);
            navigate("/dashboard");
        } else {
            toast.error(result.message);
        }
    };

    if (user?.is_verified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
                <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-800">You are Verified!</h2>
                    <p className="text-green-600 mb-6">You can accept orders freely.</p>
                    <button onClick={() => navigate("/dashboard")} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (user?.verification_status === 'pending') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Pending</h2>
                    <p className="text-slate-500 mb-6">
                        We are currently reviewing your documents. This usually takes 24 hours. You will be notified once approved.
                    </p>
                    <button onClick={() => navigate("/dashboard")} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-6 pb-24 px-6 overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Verify Account</h1>
                    <p className="text-slate-500 text-sm mt-1">Submit documents to start earning money.</p>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 mb-8">
                    <AlertCircle className="text-orange-500 shrink-0" size={24} />
                    <p className="text-sm text-orange-700">
                        To ensures safety for everyone, only verified students can accept delivery tasks.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">College ID Card (Required)</label>
                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setIdCard, setPreviewId)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${previewId ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white group-hover:bg-slate-50'}`}>
                                {previewId ? (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                        <img src={previewId} alt="ID Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white font-medium text-sm">Click to Change</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3">
                                            <CreditCard size={24} />
                                        </div>
                                        <span className="text-slate-600 font-medium text-sm">Upload Front Side</span>
                                        <span className="text-slate-400 text-xs mt-1">JPG, PNG (Max 5MB)</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Selfie (Optional if profile photo exists)</label>
                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setSelfie, setPreviewSelfie)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${previewSelfie ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white group-hover:bg-slate-50'}`}>
                                {previewSelfie ? (
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                                        <img src={previewSelfie} alt="Selfie Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3">
                                            <Camera size={24} />
                                        </div>
                                        <span className="text-slate-600 font-medium text-sm">Take a Selfie</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? "Submitting..." : "Submit Verification"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="w-full py-3 text-slate-500 font-semibold text-sm hover:text-slate-700"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerificationRequest;