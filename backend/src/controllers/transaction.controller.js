import { pool } from "../db/db.js";

const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT t.*, 
                    payer.name as paid_by_name, 
                    payee.name as paid_to_name 
             FROM transactions t
             JOIN users payer ON t.paid_by = payer.id
             JOIN users payee ON t.paid_to = payee.id
             WHERE t.paid_by = $1 OR t.paid_to = $1
             ORDER BY t.created_at DESC`,
            [userId]
        );

        res.status(200).json({
            status: "success",
            count: result.rowCount,
            data: result.rows
        });

    } catch (error) {
        console.error("Error in getUserTransactions:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const markTransactionAsPaid = async (req, res) => {
    try {
        const userId = req.user.id;
        const { transactionId } = req.params;

       
        const transactionCheck = await pool.query(
            "SELECT * FROM transactions WHERE id = $1",
            [transactionId]
        );

        if (transactionCheck.rows.length === 0) {
            return res.status(404).json({ status: "failed", message: "Transaction not found" });
        }

        const transaction = transactionCheck.rows[0];

        if (transaction.paid_to !== userId) {
            return res.status(403).json({ status: "failed", message: "Only the receiver can mark this as paid" });
        }

        if (transaction.status === 'COMPLETED') {
            return res.status(400).json({ status: "failed", message: "Transaction is already settled" });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            
            const result = await client.query(
                "UPDATE transactions SET status = 'COMPLETED' WHERE id = $1 RETURNING *",
                [transactionId]
            );

            
            await client.query(`
                INSERT INTO wallets (user_id, balance, total_earnings)
                VALUES ($1, $2, $2)
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    balance = wallets.balance + $2,
                    total_earnings = wallets.total_earnings + $2,
                    last_updated = CURRENT_TIMESTAMP
            `, [userId, transaction.amount]);

            await client.query('COMMIT');

            res.status(200).json({
                status: "success",
                message: "Transaction settled and Wallet updated",
                data: result.rows[0]
            });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Error in markTransactionAsPaid:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

const getWalletBalance = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query("SELECT * FROM wallets WHERE user_id = $1", [userId]);

        const data = result.rows.length > 0 ? result.rows[0] : { balance: 0, total_earnings: 0 };

        res.status(200).json({
            status: "success",
            data: data
        });
    } catch (error) {
        console.error("Error in getWalletBalance:", error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
};

export { getUserTransactions, markTransactionAsPaid, getWalletBalance };