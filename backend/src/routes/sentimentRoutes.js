import express from "express";
import { getSentiment } from "../controllers/sentimentController.js";

const router = express.Router();

router.get('/:symbol', getSentiment);

export default router;


