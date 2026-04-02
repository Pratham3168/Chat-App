import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import {
  acceptFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  rejectFriendRequest,
  sendFriendRequest,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/incoming", getIncomingRequests);
router.get("/outgoing", getOutgoingRequests);
router.post("/send/:id", sendFriendRequest);
router.post("/:id/accept", acceptFriendRequest);
router.post("/:id/reject", rejectFriendRequest);

export default router;