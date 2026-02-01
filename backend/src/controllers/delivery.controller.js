import { pool } from "../db/db.js";
import { sendEmail } from "../services/email.service.js";

const createDeliveryRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const {
      pickup_location,
      drop_location,
      reward_amount,
      parcel_weight,
      parcel_type,
      expected_time,
    } = req.body;

    if (!drop_location) {
      return res
        .status(400)
        .json({ status: "failed", message: "Drop location is required" });
    }

    if (reward_amount < 10 || reward_amount > 100) {
      return res
        .status(400)
        .json({
          status: "failed",
          message: "Reward amount must be between ₹10 and ₹100",
        });
    }

    const result = await pool.query(
      `INSERT INTO delivery_requests (requester_id, pickup_location, drop_location, reward_amount, parcel_weight, parcel_type, expected_time) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        requesterId,
        pickup_location || "Main Gate",
        drop_location,
        reward_amount || 10,
        parcel_weight,
        parcel_type,
        expected_time,
      ],
    );

    res.status(201).json({
      status: "success",
      message: "Delivery request created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error in createDeliveryRequest:", error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};

const getOpenDeliveryRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      location,
      min_reward,
      parcel_type,
      parcel_weight,
      max_time,
      sortBy,
      order,
    } = req.query;

    let query = `
            SELECT dr.*, u.name as requester_name, u.mobile_number as requester_contact 
            FROM delivery_requests dr
            JOIN users u ON dr.requester_id = u.id
            WHERE dr.status = 'OPEN' AND dr.requester_id != $1
        `;
    let values = [userId];
    let index = 2; // $1 is userId

    if (location) {
      query += ` AND dr.drop_location ILIKE $${index}`;
      values.push(`%${location}%`);
      index++;
    }

    if (min_reward) {
      query += ` AND dr.reward_amount >= $${index}`;
      values.push(min_reward);
      index++;
    }

    if (parcel_type) {
      query += ` AND dr.parcel_type ILIKE $${index}`;
      values.push(`%${parcel_type}%`);
      index++;
    }

    if (parcel_weight) {
      query += ` AND dr.parcel_weight ILIKE $${index}`;
      values.push(`%${parcel_weight}%`);
      index++;
    }

    if (max_time) {
      query += ` AND dr.expected_time ILIKE $${index}`;
      values.push(`%${max_time}%`);
      index++;
    }

    let sortColumn = "dr.created_at"; // Default
    let sortDirection = "DESC"; // Default

    if (sortBy === "reward") sortColumn = "dr.reward_amount";
    if (sortBy === "time") sortColumn = "dr.expected_time";
    if (sortBy === "newest") sortColumn = "dr.created_at";

    if (
      order &&
      (order.toUpperCase() === "ASC" || order.toUpperCase() === "DESC")
    ) {
      sortDirection = order.toUpperCase();
    }

    query += ` ORDER BY ${sortColumn} ${sortDirection}`;

    const result = await pool.query(query, values);

    res.status(200).json({
      status: "success",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error in getOpenDeliveryRequests:", error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};

const acceptDeliveryRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const deliveryPersonId = req.user.id;

    const userCheck = await pool.query(
      "SELECT is_verified FROM users WHERE id = $1",
      [deliveryPersonId],
    );
    if (!userCheck.rows[0]?.is_verified) {
      return res
        .status(403)
        .json({
          status: "failed",
          message: "You must be verified to accept delivery requests",
        });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updateResult = await client.query(
        "UPDATE delivery_requests SET status = 'ASSIGNED' WHERE id = $1 AND status = 'OPEN' RETURNING *",
        [requestId],
      );

      if (updateResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return res
          .status(409)
          .json({
            status: "failed",
            message:
              "Request unavailable. It may have been taken by someone else.",
          });
      }

      const assignment = await client.query(
        `INSERT INTO delivery_assignments (delivery_request_id, delivery_person_id) 
                 VALUES ($1, $2) RETURNING *`,
        [requestId, deliveryPersonId],
      );

      const requestData = updateResult.rows[0];
      await client.query(
        "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
        [requestData.requester_id, `Your order has been accepted!`],
      );

      const userRes = await client.query(
        "SELECT institute_email, name FROM users WHERE id = $1",
        [requestData.requester_id],
      );
      if (userRes.rows.length > 0) {
        const { institute_email, name } = userRes.rows[0];
        sendEmail(
          institute_email,
          "Order Accepted - CarryCampus",
          `Hi ${name},\n\nYour delivery request has been ACCEPTED by a delivery person.`,
        ).catch((e) => console.error("Error sending acceptance email:", e));
      }

      await client.query("COMMIT");

      res.status(200).json({
        status: "success",
        message: "Request accepted successfully",
        data: assignment.rows[0],
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in acceptDeliveryRequest:", error);
    res.status(500).json({
      status: "failed",
      message: "Server Error: " + error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // PICKED, DELIVERED
    const userId = req.user.id;

    const validStatuses = ["PICKED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid status" });
    }

    const assignmentCheck = await pool.query(
      "SELECT * FROM delivery_assignments WHERE delivery_request_id = $1 AND delivery_person_id = $2",
      [requestId, userId],
    );

    if (assignmentCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ status: "failed", message: "Not authorized or not assigned" });
    }

    const result = await pool.query(
      "UPDATE delivery_requests SET status = $1 WHERE id = $2 RETURNING *",
      [status, requestId],
    );

    if (status === "DELIVERED") {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        await client.query(
          "UPDATE delivery_assignments SET completed_at = NOW() WHERE delivery_request_id = $1",
          [requestId],
        );

        const requestDetails = await client.query(
          "SELECT requester_id, reward_amount FROM delivery_requests WHERE id = $1",
          [requestId],
        );

        const { requester_id, reward_amount } = requestDetails.rows[0];

        // Create Transaction Record
        await client.query(
          `INSERT INTO transactions (delivery_request_id, paid_by, paid_to, amount, status) 
                     VALUES ($1, $2, $3, $4, 'COMPLETED')`,
          [requestId, requester_id, userId, reward_amount],
        );

        await client.query(
          `INSERT INTO wallets (user_id, balance, total_earnings, last_updated) 
                     VALUES ($1, $2, $2, NOW()) 
                     ON CONFLICT (user_id) 
                     DO UPDATE SET 
                        balance = wallets.balance + EXCLUDED.balance, 
                        total_earnings = wallets.total_earnings + EXCLUDED.total_earnings,
                        last_updated = NOW()`,
          [userId, reward_amount],
        );

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    }

    const updatedRequest = result.rows[0];
    await pool.query(
      "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
      [
        updatedRequest.requester_id,
        `Your order status is updated to: ${status}`,
      ],
    );

    const userRes = await pool.query(
      "SELECT institute_email, name FROM users WHERE id = $1",
      [updatedRequest.requester_id],
    );
    if (userRes.rows.length > 0) {
      const { institute_email, name } = userRes.rows[0];
      sendEmail(
        institute_email,
        `Order ${status} - CarryCampus`,
        `Hi ${name},\n\nYour delivery request status has been updated to: ${status}.`,
      ).catch((e) => console.error("Error sending status email:", e));
    }

    res.status(200).json({
      status: "success",
      message: `Status updated to ${status}`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error in updateDeliveryStatus:", error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};

const getMyCreatedRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT dr.*, 
            EXISTS(SELECT 1 FROM reviews r WHERE r.delivery_request_id = dr.id) as is_reviewed
            FROM delivery_requests dr 
            WHERE dr.requester_id = $1 
            ORDER BY dr.created_at DESC`,
      [userId],
    );

    res.status(200).json({
      status: "success",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error in getMyCreatedRequests:", error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};

const getMyAcceptedDeliveries = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
            SELECT dr.*, da.accepted_at, da.completed_at, u.name as requester_name, u.mobile_number as requester_contact
            FROM delivery_assignments da
            JOIN delivery_requests dr ON da.delivery_request_id = dr.id
            JOIN users u ON dr.requester_id = u.id
            WHERE da.delivery_person_id = $1
            ORDER BY da.accepted_at DESC
        `;

    const result = await pool.query(query, [userId]);

    res.status(200).json({
      status: "success",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error in getMyAcceptedDeliveries:", error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};

const cancelDeliveryRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Verify request ownership and status
    const requestCheck = await pool.query(
      "SELECT * FROM delivery_requests WHERE id = $1 AND requester_id = $2",
      [requestId, userId],
    );

    if (requestCheck.rows.length === 0) {
      return res
        .status(404)
        .json({
          status: "failed",
          message: "Request not found or unauthorized",
        });
    }

    const request = requestCheck.rows[0];

    // Allow cancellation if OPEN or ASSIGNED. Block if PICKED/DELIVERED.
    if (["PICKED", "DELIVERED", "CANCELLED"].includes(request.status)) {
      return res
        .status(400)
        .json({
          status: "failed",
          message: `Cannot cancel request with status: ${request.status}`,
        });
    }

    if (request.status === "ASSIGNED") {
      const assignment = await pool.query(
        "SELECT * FROM delivery_assignments WHERE delivery_request_id = $1",
        [requestId],
      );
      if (assignment.rows.length > 0) {
        const deliveryPersonId = assignment.rows[0].delivery_person_id;

        // Notify Delivery Person
        await pool.query(
          "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
          [
            deliveryPersonId,
            `Order #${requestId} was CANCELLED by the requester.`,
          ],
        );

        const dpUser = await pool.query(
          "SELECT institute_email, name FROM users WHERE id = $1",
          [deliveryPersonId],
        );
        if (dpUser.rows.length > 0) {
          const { institute_email, name } = dpUser.rows[0];
          sendEmail(
            institute_email,
            "Order Cancelled - CarryCampus",
            `Hi ${name},\n\nThe order you accepted (ID #${requestId}) has been CANCELLED by the requester.`,
          ).catch((e) => console.error("Error sending cancellation email:", e));
        }
      }
    }

    const result = await pool.query(
      "UPDATE delivery_requests SET status = 'CANCELLED' WHERE id = $1 RETURNING *",
      [requestId],
    );

    res.status(200).json({
      status: "success",
      message: "Request cancelled successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error in cancelDeliveryRequest:", error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};

export {
  createDeliveryRequest,
  getOpenDeliveryRequests,
  acceptDeliveryRequest,
  updateDeliveryStatus,
  getMyCreatedRequests,
  getMyAcceptedDeliveries,
  cancelDeliveryRequest,
};