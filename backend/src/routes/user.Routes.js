import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserProfile, updateUserProfile, toggleAvailability, getAvailableStats } from "../controllers/user.Controller.js";

const router = express.Router();

router.route("/profile").get(verifyJWT, getUserProfile);
router.route("/profile").patch(verifyJWT, updateUserProfile);
router.route("/availability").patch(verifyJWT, toggleAvailability);
router.route("/availability").get(verifyJWT, getAvailableStats);

export default router;