import { Router } from "express";
import { ProductController } from "../controllers/products.controller.js";
const router = Router();
const controller = new ProductController();
router.get("/getAll", (req, res) => controller.getAll(req, res));
router.get("/getById/:id", (req, res) => controller.getById(req, res));
export default router;
