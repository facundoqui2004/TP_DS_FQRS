import { Request, Response } from "express";
import { Metahumano } from "../models/metahumano.model.js";
import jwt from 'jsonwebtoken';
import { createAccessToken } from "../libs/jwts.js";
// Base de datos en memoria (solo para pruebas)
const metahumanos: Metahumano[] = [];

// Obtener todos los metahumanos
export const getMetahumanos = async (req: Request, res: Response) => {
    res.json({ data: metahumanos });
};

// Obtener un metahumano por id
export const getMetahumano = async (req: Request, res: Response) => {
    const id = req.params.id;
    const meta = metahumanos.find(m => m.id === id);
    if (!meta) {
        return res.status(404).json({ error: "No encontrado" });
    }
    /*const token = await createAccessToken({
      id: meta.id,
      username: meta.nombre,
    });
    res.cookie("token", token, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
    });*/

    res.json({ data: meta });
};

// Crear un metahumano
export const createMetahumano = async (req: Request, res: Response) => {
    console.log('BODY RECIBIDO:', req.body);

    // Permite que poderes y debilidades vengan como string o array
    let poderes = req.body.poderes;
    let debilidades = req.body.debilidades;

    if (typeof poderes === "string") poderes = [poderes];
    if (typeof debilidades === "string") debilidades = [debilidades];

    // Validación
    if (!Array.isArray(poderes) || !Array.isArray(debilidades)) {
        return res.status(400).json({ error: "poderes y debilidades deben ser arrays" });
    }

    // Instancia nueva
    const nuevo = new Metahumano(
        poderes,
        debilidades,
        req.body.fechaLicencia ? new Date(req.body.fechaLicencia) : new Date(),
        req.body.estadoLicencia,
        req.body.id,
        req.body.nombre,
        req.body.alias,
        req.body.origen,
        req.body.telefono,
        req.body.mail
    );
    metahumanos.push(nuevo);

    res.status(201).json({ message: "Metahumano creado", data: nuevo });
};

// Actualizar un metahumano
export const updateMetahumano = async (req: Request, res: Response) => {
    const id = req.params.id;
    const index = metahumanos.findIndex(m => m.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "No encontrado" });
    }
    // Permite que poderes y debilidades vengan como string o array
    let poderes = req.body.poderes ?? metahumanos[index].poderes;
    let debilidades = req.body.debilidades ?? metahumanos[index].debilidades;
    if (typeof poderes === "string") poderes = [poderes];
    if (typeof debilidades === "string") debilidades = [debilidades];
    if (!Array.isArray(poderes) || !Array.isArray(debilidades)) {
        return res.status(400).json({ error: "poderes y debilidades deben ser arrays" });
    }

    // Solo actualiza los campos recibidos
    metahumanos[index] = {
        ...metahumanos[index],
        poderes,
        debilidades,
        fechaLicencia: req.body.fechaLicencia ? new Date(req.body.fechaLicencia) : metahumanos[index].fechaLicencia,
        estadoLicencia: req.body.estadoLicencia ?? metahumanos[index].estadoLicencia,
        // id nunca se actualiza
        nombre: req.body.nombre ?? metahumanos[index].nombre,
        alias: req.body.alias ?? metahumanos[index].alias,
        origen: req.body.origen ?? metahumanos[index].origen,
        telefono: req.body.telefono ?? metahumanos[index].telefono,
        mail: req.body.mail ?? metahumanos[index].mail
    };
    res.json({ message: `Metahumano ${id} actualizado`, data: metahumanos[index] });
};

// Eliminar un metahumano
export const deleteMetahumano = async (req: Request, res: Response) => {
    const id = req.params.id;
    const index = metahumanos.findIndex(m => m.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "No encontrado" });
    }
    metahumanos.splice(index, 1);
    res.json({ message: `Metahumano ${id} eliminado` });
};





