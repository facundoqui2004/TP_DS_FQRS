import { Router } from "express";
import {
    getMetahumanos,
    getMetahumano,
    createMetahumano,
    updateMetahumano,
    deleteMetahumano
} from "../controller/metahumano.controller.js";

const router = Router();

router.get("/", getMetahumanos);
router.get("/:id", getMetahumano);
router.post("/", createMetahumano);
router.put("/:id", updateMetahumano);
router.delete("/:id", deleteMetahumano);

export default router;
