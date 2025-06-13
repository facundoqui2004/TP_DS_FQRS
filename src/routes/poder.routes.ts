import { Router } from "express";
import {
    getPoderes,
    getPoder,
    createPoder,
    updatePoder,
    deletePoder
} from "../controller/poder.controller.js";
const router = Router();

// Define las rutas para los poderes
router.get("/", getPoderes);
router.get("/:id", getPoder);
router.post("/", createPoder);
router.put("/:id", updatePoder);
router.delete("/:id", deletePoder);

export default router;
