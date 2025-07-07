import { Request, Response } from "express";
import { PoderService } from "../services/poder.service.js";

export class PoderController {
  constructor(private readonly service: PoderService) {}

  getPoderes = async (req: Request, res: Response): Promise<void> => {
    const poderes = await this.service.getAll();
    res.json({ data: poderes });
  };

  getPoder = async (req: Request, res: Response): Promise<void> => {
    try {
      const poder = await this.service.getById(req.params.id);
      res.json({ data: poder });
    } catch {
      res.status(404).json({ error: "No encontrado" });
    }
  };

  createPoder = async (req: Request, res: Response): Promise<void> => {
    if (!req.body.nom_poder || !req.body.debilidad) {
      res.status(400).json({ error: "nom_poder y debilidad son requeridos" });
      return;
    }
    const nuevo = await this.service.create(req.body);
    res.status(201).json({ message: "Poder creado", data: nuevo });
  };

  updatePoder = async (req: Request, res: Response): Promise<void> => {
    try {
      const actualizado = await this.service.update(req.params.id, req.body);
      res.json({ message: "Poder actualizado", data: actualizado });
    } catch {
      res.status(404).json({ error: "No encontrado" });
    }
  };

  deletePoder = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      res.json({ message: "Poder eliminado" });
    } catch {
      res.status(404).json({ error: "No encontrado" });
    }
  };
}
