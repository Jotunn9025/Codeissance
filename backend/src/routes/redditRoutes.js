import express from "express";
import { getReddit } from "../controllers/redditController.js";

const router = express.Router();

router.get('/:symbol', getReddit);

export default router;


