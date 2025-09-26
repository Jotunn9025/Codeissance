import express from "express";
import { getStockChart } from "../controllers/financeController.js";

const router = express.Router();

router.get('/:symbol', getStockChart);

export default router;


