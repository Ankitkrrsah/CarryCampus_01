import { pool } from "../db/db.js";

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            "SELECT id, roll_number, name, institute_email, mobile_number, room_number, selfie_url, role, created_at FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        res.status(200).json({
            status: "success",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, mobile_number, selfie_url } = req.body;

        // Construct dynamic update query
        let updateFields = [];
        let values = [];
        let index = 1;

        if (name) {
            updateFields.push(`name = $${index}`);
            values.push(name);
            index++;
        }
        if (mobile_number) {
            updateFields.push(`mobile_number = $${index}`);
            values.push(mobile_number);
            index++;
        }
        if (selfie_url) {
            updateFields.push(`selfie_url = $${index}`);
            values.push(selfie_url);
            index++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ status: "failed", message: "No fields to update" });
        }

        values.push(userId);
        const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING id, roll_number, name, institute_email, mobile_number, room_number, selfie_url, role`;

        const result = await pool.query(query, values);

        res.status(200).json({
            status: "success",
            message: "Profile updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const toggleAvailability = async (req, res) => {
    try {
        const userId = req.user.id;
        const { is_available } = req.body;

        if (typeof is_available !== 'boolean') {
            return res.status(400).json({ status: "failed", message: "is_available must be a boolean" });
        }

        const result = await pool.query(
            "UPDATE users SET is_available = $1 WHERE id = $2 RETURNING id, name, is_available",
            [is_available, userId]
        );

        res.status(200).json({
            status: "success",
            message: `Availability updated to ${is_available}`,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Error in toggleAvailability:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const getAvailableStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Count others who are available
        const countResult = await pool.query(
            "SELECT COUNT(*) FROM users WHERE is_available = true AND id != $1",
            [userId]
        );

        // Get my own status
        const myStatusResult = await pool.query(
            "SELECT is_available FROM users WHERE id = $1",
            [userId]
        );

        const count = parseInt(countResult.rows[0].count);
        const myStatus = myStatusResult.rows[0]?.is_available || false;

        res.status(200).json({
            status: "success",
            count: count,
            my_status: myStatus,
            message: `${count} other students are currently available.`
        });

    } catch (error) {
        console.error("Error in getAvailableStats:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

export { getUserProfile, updateUserProfile, toggleAvailability, getAvailableStats };
