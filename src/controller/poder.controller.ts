import { Request, Response } from "express";
import { Poder } from "../models/poder.model.js";

const poderes: Poder[] = [];
//Obtener todos los poderes
export const getPoderes = (req: Request, res: Response) => {
    res.json({ data: poderes });
}
//Obtener un poder por id
export const getPoder = (req: Request, res: Response) => {
    const id = req.params.id;
    const poder = poderes.find(p => p.id_Poder === id);
    if (!poder) {
        return res.status(404).json({ error: "No encontrado" });
    }
    res.json({ data: poder });
}
//Crear un poder
export const createPoder = (req: Request, res: Response) => {
    console.log('BODY RECIBIDO:', req.body);
    
    // Validación
    if (!req.body.nom_poder || !req.body.debilidad) {
        return res.status(400).json({ error: "nom_poder y debilidad son requeridos" });
    }
    // Instancia nueva
    const nuevo = new Poder(
        undefined,
        req.body.nom_poder,
        req.body.debilidad,
        req.body.desc_poder,
        req.body.desc_debilidad,
        req.body.categoria,
        req.body.costoMulta
    );
    poderes.push(nuevo);

    res.status(201).json({ message: "Poder creado", data: nuevo });
}
// Actualizar un poder
export const updatePoder = (req: Request, res: Response) => {
    const id = req.params.id;
    const index = poderes.findIndex(p => p.id_Poder === id);
    if (index === -1) {
        return res.status(404).json({ error: "No encontrado" });
    }
    
    // Actualiza los campos del poder
    poderes[index].nom_poder = req.body.nom_poder ?? poderes[index].nom_poder;
    poderes[index].debilidad = req.body.debilidad ?? poderes[index].debilidad;
    poderes[index].desc_poder = req.body.desc_poder ?? poderes[index].desc_poder;
    poderes[index].desc_debilidad = req.body.desc_debilidad ?? poderes[index].desc_debilidad;
    poderes[index].categoria = req.body.categoria ?? poderes[index].categoria;
    poderes[index].costoMulta = req.body.costoMulta ?? poderes[index].costoMulta;

    res.json({ message: "Poder actualizado", data: poderes[index] });
}
// Eliminar un poder
export const deletePoder = (req: Request, res: Response) => {
    const id = req.params.id;
    const index = poderes.findIndex(p => p.id_Poder === id);
    if (index === -1) {
        return res.status(404).json({ error: "No encontrado" });
    }
    
    // Elimina el poder
    poderes.splice(index, 1);
    
    res.json({ message: "Poder eliminado" });
}
