import { pool } from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/email.service.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";
const registerUser = async (req, res) => {
    try {
        const { roll_number, name, institute_email, mobile_number, room_number, password } = req.body;

        let selfie_url = "";
        if (req.file) {
            const uploadResponse = await uploadOnCloudinary(req.file.path);
            if (uploadResponse) {
                selfie_url = uploadResponse.url;
            }
        }

        if (!roll_number || !name || !institute_email || !mobile_number || !room_number || !password) {
            return res.status(400).json({ status: "failed", message: "All fields are required" });
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE roll_number = $1 OR institute_email = $2",
            [roll_number, institute_email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ status: "failed", message: "User already exists! Please Login." });
        }

        const roomCount = await pool.query(
            "SELECT COUNT(*) FROM users WHERE room_number = $1",
            [room_number]
        );

        if (parseInt(roomCount.rows[0].count) >= 3) {
            return res.status(400).json({ status: "failed", message: "3 users already registered with this Room Number" });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60000); // 10 mins

        // Fix: Use correct column names from migration
        const newUser = await pool.query(
            `INSERT INTO users (roll_number, name, institute_email, mobile_number, room_number, selfie_url, password_hash, email_otp, email_otp_expires_at, is_email_verified) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE) RETURNING id, roll_number, name, institute_email, mobile_number, room_number, role, is_verified, created_at`,
            [roll_number, name, institute_email, mobile_number, room_number, selfie_url, password_hash, otp, otpExpiresAt]
        );

        const createdUser = newUser.rows[0];

        // Send OTP Email
        const emailSubject = "Verify your Email - CarryCampus";
        const emailBody = `
            <h2>Hi ${createdUser.name},</h2>
            <p>Thanks for joining CarryCampus! Please verify your email to proceed.</p>
            <h3>Your OTP is: <b style="font-size: 24px;">${otp}</b></h3>
            <p>This OTP will expire in 10 minutes.</p>
        `;

        sendEmail(createdUser.institute_email, emailSubject, `Your OTP is ${otp}`, emailBody)
            .catch(err => console.error("Failed to send verification email:", err));

        res.status(201).json({
            status: "success",
            message: "Account created! Please verify your email.",
            data: { email: createdUser.institute_email }
        });

    } catch (error) {
        console.error("Error in createAccount:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { roll_number, name, institute_email, mobile_number, room_number, password, admin_secret } = req.body;

        const validSecret = process.env.SECRET_ADMIN_KEY || process.env.ADMIN_SECRET || "SECRET_ADMIN_KEY";
        if (admin_secret !== validSecret) {
            return res.status(403).json({ status: "failed", message: "Invalid Admin Secret Key" });
        }

        // ... (Similar validation but skip room count maybe? Let's keep it robust)
        if (!roll_number || !name || !institute_email || !mobile_number || !password) {
            return res.status(400).json({ status: "failed", message: "All fields are required" });
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE roll_number = $1 OR institute_email = $2",
            [roll_number, institute_email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ status: "failed", message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Force Role = ADMIN and Verified = true
        const newUser = await pool.query(
            `INSERT INTO users (roll_number, name, institute_email, mobile_number, room_number, password_hash, role, is_verified, verification_status) 
             VALUES ($1, $2, $3, $4, $5, $6, 'ADMIN', true, 'verified') RETURNING id, name, institute_email, role`,
            [roll_number, name, institute_email, mobile_number, room_number || 'ADMIN', password_hash]
        );

        res.status(201).json({
            status: "success",
            message: "Admin Account created successfully",
            data: newUser.rows[0]
        });

    } catch (error) {
        console.error("Error in registerAdmin:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: "failed", message: "Email and password are required" });
        }

        const userResult = await pool.query(
            "SELECT * FROM users WHERE institute_email = $1 OR roll_number = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ status: "failed", message: "Account not found. Please register." });
        }

        const user = userResult.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ status: "failed", message: "Incorrect password" });
        }

        if (!user.is_email_verified && user.role !== 'ADMIN') { // Admins might bypass
            return res.status(403).json({
                status: "failed",
                code: "EMAIL_NOT_VERIFIED",
                message: "Please verify your email first.",
                data: { email: user.institute_email }
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.institute_email },
            process.env.ACCESS_TOKEN_SECRET || "default_secret",
            { expiresIn: "1d" }
        );

        const { password_hash, ...userWithoutPassword } = user;

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            status: "success",
            message: "Logged in successfully",
            token,
            data: userWithoutPassword
        });

    } catch (error) {
        console.error("Error in signIn:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ status: "success", message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};


const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ status: "failed", message: "Both old and new passwords are required" });
        }

        // Get user's current password hash
        const userResult = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        const user = userResult.rows[0];

        // Verify Old Password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ status: "failed", message: "Incorrect old password" });
        }

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update Password
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newPasswordHash, userId]);

        res.status(200).json({ status: "success", message: "Password updated successfully" });

    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const userResult = await pool.query(
            "SELECT id, roll_number, name, institute_email, mobile_number, room_number, role, is_verified, verification_status, selfie_url, created_at FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        res.status(200).json({
            status: "success",
            data: userResult.rows[0]
        });
    } catch (error) {
        console.error("Error in getCurrentUser:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const userResult = await pool.query("SELECT * FROM users WHERE institute_email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        const user = userResult.rows[0];

        if (user.is_email_verified) {
            return res.status(200).json({ status: "success", message: "Email already verified" });
        }

        if (user.email_otp !== otp) {
            return res.status(400).json({ status: "failed", message: "Invalid OTP" });
        }

        if (new Date() > new Date(user.email_otp_expires_at)) {
            return res.status(400).json({ status: "failed", message: "OTP Expired" });
        }

        await pool.query(
            "UPDATE users SET is_email_verified = TRUE, email_otp = NULL, email_otp_expires_at = NULL WHERE id = $1",
            [user.id]
        );

        res.status(200).json({ status: "success", message: "Email Verified Successfully!" });

    } catch (error) {
        console.error("Error in verifyEmailOTP:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const userResult = await pool.query("SELECT * FROM users WHERE institute_email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }
        const user = userResult.rows[0];

        if (user.is_email_verified) {
            return res.status(200).json({ status: "success", message: "Already Verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60000);

        await pool.query("UPDATE users SET email_otp = $1, email_otp_expires_at = $2 WHERE id = $3", [otp, otpExpiresAt, user.id]);

        sendEmail(user.institute_email, "Resend OTP - CarryCampus", `Your Verification OTP is ${otp}`,
            `<h3>Your OTP is: <b>${otp}</b></h3>`)
            .catch(console.error);

        res.status(200).json({ status: "success", message: "OTP Resent" });
    } catch (e) {
        res.status(500).json({ status: "failed", message: "Server Error" });
    }
};

export { registerUser, registerAdmin, loginUser, logoutUser, changePassword, getCurrentUser, verifyEmailOTP, resendOTP };