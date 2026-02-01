import { pool } from "../db/db.js";

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );

        res.status(200).json({
            status: "success",
            count: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        console.error("Error in getNotifications:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await pool.query("UPDATE notifications SET is_read = true WHERE user_id = $1", [userId]);
        res.status(200).json({ status: "success", message: "Marked all as read" });
    } catch (error) {
        
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

export { getNotifications, markAsRead };