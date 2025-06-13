// Importing necessary modules and functions


import express, { Router } from "express";
const router = Router();
export default router;
import {
    getMetahumanos,
    getMetahumano,
    createMetahumano,
    updateMetahumano,
    deleteMetahumano
} from "../controller/metahumano.controller.js";
import  solicitudesRoutes  from './solicitudes.routes.js';
const app = express();
app.use("/:id/solicitud-poderes/")

router.get("/", getMetahumanos);
router.get("/:id", getMetahumano);
router.post("/", createMetahumano);
router.put("/:id", updateMetahumano);
router.delete("/:id", deleteMetahumano);




