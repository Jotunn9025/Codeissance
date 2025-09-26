import express from "express";
import { getForecast } from "../controllers/mlController.js";

const router = express.Router();

router.get('/forecast', getForecast);

export default router;


