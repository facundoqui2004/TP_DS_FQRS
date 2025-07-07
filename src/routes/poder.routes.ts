import { Router } from "express";
import { PoderController } from "../controller/poder.controller.js";
import { PoderService } from "../services/poder.service.js";
import { InMemoryPoderRepository } from "../repositories/in-memory-poder.repository.js";

import { PoderController } from "../controller/poder.controller.js";
import { PoderService } from "../services/poder.service.js";
import { InMemoryPoderRepository } from "../repositories/in-memory-poder.repository.js";

const router = Router();

const repository = new InMemoryPoderRepository();
const service = new PoderService(repository);
const controller = new PoderController(service);

// Define las rutas para los poderes
router.get("/", controller.getPoderes);
router.get("/:id", controller.getPoder);
router.post("/", controller.createPoder);
router.put("/:id", controller.updatePoder);
router.delete("/:id", controller.deletePoder);

export default router;


/*import { Router } from "express";
import {
    getPoderes,
    getPoder,
    createPoder,
    updatePoder,
    deletePoder
} from "../controller/poder.controller.js";
const router = Router();

const repository = new InMemoryPoderRepository();
const service = new PoderService(repository);
const controller = new PoderController(service);

// Define las rutas para los poderes
router.get("/", controller.getPoderes);
router.get("/:id", controller.getPoder);
router.post("/", controller.createPoder);
router.put("/:id", controller.updatePoder);
router.delete("/:id", controller.deletePoder);

export default router;
*/