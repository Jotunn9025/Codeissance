import express from "express";
import { runTimeSeriesForecast } from "../controllers/timeSeriesController.js";

const router = express.Router();

router.get('/', runTimeSeriesForecast);

export default router;


