
import { pool } from "../db/db.js";
import { sendEmail } from "../services/email.service.js";
import bcrypt from "bcrypt";

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: "failed", message: "Email is required" });
        }

        const userCheck = await pool.query("SELECT * FROM users WHERE institute_email = $1", [email]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP
        await pool.query(
            "INSERT INTO password_resets (email, otp, expires_at) VALUES ($1, $2, $3)",
            [email, otp, expiresAt]
        );

        // Send Email
        await sendEmail(
            email,
            "Reset Password - CarryCampus",
            `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
            `<p>Your OTP for password reset is: <b>${otp}</b></p><p>It expires in 10 minutes.</p>`
        );

        res.status(200).json({ status: "success", message: "OTP sent to email" });

    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ status: "failed", message: "All fields are required" });
        }

        // Verify OTP
        const otpCheck = await pool.query(
            "SELECT * FROM password_resets WHERE email = $1 AND otp = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
            [email, otp]
        );

        if (otpCheck.rows.length === 0) {
            return res.status(400).json({ status: "failed", message: "Invalid or expired OTP" });
        }

        // Update Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await pool.query("UPDATE users SET password_hash = $1 WHERE institute_email = $2", [passwordHash, email]);

        // Cleanup used OTPs
        await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);

        res.status(200).json({ status: "success", message: "Password reset successfully" });

    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ status: "failed", message: "Email and OTP are required" });
        }

        const otpCheck = await pool.query(
            "SELECT * FROM password_resets WHERE email = $1 AND otp = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
            [email, otp]
        );

        if (otpCheck.rows.length === 0) {
            return res.status(400).json({ status: "failed", message: "Invalid or expired OTP" });
        }

        res.status(200).json({ status: "success", message: "OTP Verified" });

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

export { forgotPassword, verifyOtp, resetPassword };
