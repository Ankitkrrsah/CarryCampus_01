
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getNotifications, markAsRead } from "../controllers/notification.Controller.js";

const router = express.Router();

router.use(verifyJWT);
router.route("/").get(getNotifications);
router.route("/read-all").patch(markAsRead);

export default router;
