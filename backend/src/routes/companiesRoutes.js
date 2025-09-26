import express from "express";
import { getCompaniesSummary } from "../controllers/companiesController.js";

const router = express.Router();

router.get('/', getCompaniesSummary);

export default router;


