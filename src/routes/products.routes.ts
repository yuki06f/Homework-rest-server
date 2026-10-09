import { Router } from "express";
import { ProductController } from "../controllers/products.controller.ts";

const router = Router();
const controller = new ProductController();

router.get("/getAll", (req, res) => controller.getAll(req, res));
router.get("/getById/:id", (req, res) => controller.getById(req, res));
router.post("/create", (req, res) => controller.create(req, res));
router.put("/update/:id", (req, res) => controller.update(req, res));
router.delete("/delete/:id", (req, res) => controller.delete(req, res));
router.patch("/change-price/:id", (req, res) => controller.changePrice(req, res));

export default router;