import express from "express";
import { getVelocity } from "../controllers/velocityController.js";

const router = express.Router();

router.get('/', getVelocity);

export default router;


