import { Request, Response } from "express";
import { Solicitud } from "../models/solicitudes.model.js";

const solicitudes: Solicitud[] = [];

// Obtener todas las solicitudes
export const getSolicitudes = (req: Request, res: Response) => {
  res.json({ data: solicitudes });
};

// Obtener una solicitud por id
export const getSolicitud = (req: Request, res: Response) => {
  const id = req.params.id;
  const solicitud = solicitudes.find((s) => s.id_solicitud === id);
  if (!solicitud) {
    return res.status(404).json({ error: "No encontrado" });
  }
  res.json({ data: solicitud });
};

// Crear una solicitud
export const createSolicitud = (req: Request, res: Response) => {
  const nuevo = new Solicitud(
    undefined,
    req.body.id_meta,
    req.body.id_poder,
    req.body.fecha_solicitud ? new Date(req.body.fecha_solicitud) : new Date(),
    req.body.estado,
    req.body.descripcion
  );
  solicitudes.push(nuevo);

  res.status(201).json({ message: "Solicitud creada", data: nuevo });
};

// Actualizar una solicitud
export const updateSolicitud = (req: Request, res: Response) => {
  const id = req.params.id;
  const index = solicitudes.findIndex((s) => s.id_solicitud === id);
  if (index === -1) {
    return res.status(404).json({ error: "No encontrado" });
  }

  solicitudes[index] = {
    ...solicitudes[index],
    id_meta: req.body.id_meta ?? solicitudes[index].id_meta,
    id_poder: req.body.id_poder ?? solicitudes[index].id_poder,
    fecha_solicitud: req.body.fecha_solicitud
      ? new Date(req.body.fecha_solicitud)
      : solicitudes[index].fecha_solicitud,
    estado: req.body.estado ?? solicitudes[index].estado,
    descripcion: req.body.descripcion ?? solicitudes[index].descripcion,
  };

  res.json({ message: `Solicitud ${id} actualizada`, data: solicitudes[index] });
};

// Eliminar una solicitud
export const deleteSolicitud = (req: Request, res: Response) => {
  const id = req.params.id;
  const index = solicitudes.findIndex((s) => s.id_solicitud === id);
  if (index === -1) {
    return res.status(404).json({ error: "No encontrado" });
  }

  solicitudes.splice(index, 1);
  res.json({ message: `Solicitud ${id} eliminada` });
};

