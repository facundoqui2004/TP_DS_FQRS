import { Router } from "express";
const router = Router();
import {
    getSolicitudes,
    getSolicitud,
    createSolicitud,
    updateSolicitud
} from "./controller/solicitud.controller.ts";
