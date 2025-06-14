import { Router } from "express";
import {
  getSolicitudes,
  getSolicitud,
  createSolicitud,
  updateSolicitud,
  deleteSolicitud,
} from "../controller/solicitud.controller.js";

const router = Router();

router.get("/", getSolicitudes);
router.get("/:id", getSolicitud);
router.post("/", createSolicitud);
router.put("/:id", updateSolicitud);
router.delete("/:id", deleteSolicitud);

export default router;
