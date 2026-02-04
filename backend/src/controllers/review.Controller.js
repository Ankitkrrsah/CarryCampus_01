
import { pool } from "../db/db.js";

const createReview = async (req, res) => {
    try {
        const { id: reviewerId } = req.user;
        const { delivery_request_id, rating, comment } = req.body;

        if (!delivery_request_id || !rating) {
            return res.status(400).json({ status: "failed", message: "Request ID and Rating are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ status: "failed", message: "Rating must be between 1 and 5" });
        }

        
        const orderCheck = await pool.query(
            `SELECT dr.*, da.delivery_person_id 
             FROM delivery_requests dr
             JOIN delivery_assignments da ON dr.id = da.delivery_request_id
             WHERE dr.id = $1 AND dr.requester_id = $2 AND dr.status IN ('DELIVERED', 'COMPLETED')`,
            [delivery_request_id, reviewerId]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(400).json({ status: "failed", message: "Invalid order. Must be completed and owned by you." });
        }

        const revieweeId = orderCheck.rows[0].delivery_person_id;

        
        const existingReview = await pool.query(
            "SELECT * FROM reviews WHERE delivery_request_id = $1",
            [delivery_request_id]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({ status: "failed", message: "You have already reviewed this delivery." });
        }

        
        const result = await pool.query(
            `INSERT INTO reviews (delivery_request_id, reviewer_id, reviewee_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [delivery_request_id, reviewerId, revieweeId, rating, comment]
        );

        res.status(201).json({
            status: "success",
            message: "Review submitted successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Error in createReview:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;

        
        const result = await pool.query(
            `SELECT r.*, u.name as reviewer_name, u.selfie_url as reviewer_image
             FROM reviews r
             JOIN users u ON r.reviewer_id = u.id
             WHERE r.reviewee_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );

    
        const avgResult = await pool.query(
            "SELECT AVG(rating) as average_rating FROM reviews WHERE reviewee_id = $1",
            [userId]
        );

        res.status(200).json({
            status: "success",
            average_rating: parseFloat(avgResult.rows[0].average_rating || 0).toFixed(1),
            count: result.rowCount,
            data: result.rows
        });

    } catch (error) {
        console.error("Error in getUserReviews:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

export { createReview, getUserReviews };