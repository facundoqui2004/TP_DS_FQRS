import { Request, Response,NextFunction } from "express";
import { Carpeta } from "./carpeta.entity.js";
import { Metahumano } from '../metahumano/metahumano.entity.js';
import { orm } from "../shared/db/orm.js";
import { Burocrata } from "../Burocratas/Burocrata.entity.js";
import { Multa } from '../Multas/Multa.entity.js';


const em = orm.em

function sanitizeCarpetaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    estado : req.body.estado,
    tipo: req.body.tipo,
    descripcion: req.body.descripcion,
    burocrataId: req.body.burocrataId,
    metahumanoId: req.body.metahumanoId
  }   
  // Eliminar claves undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function getCarpetasByMetahumano(req: Request, res : Response){
  try{
    const idMetahumano = Number.parseInt(req.params.idMetahumano)
    const carpetas = await em.find(Carpeta, {metahumano : idMetahumano}, {populate : ['evidencias.multas']})
    res.status(200).json({message : 'found carpetas by metahumano', data : carpetas})
  }
  catch(error: any){
    res.status(500).json({message : error.message})
  }
}

async function findAll(req:Request, res:Response){
    try {
    const carpetas = await em.find(Carpeta, {}, {populate :['metahumano', 'burocrata', 'evidencias.multas']})
    res.status(200).json({message : 'find All carpetas', data: carpetas})
    } catch (error : any) {
      res.status(500).json({error:error.message})  
    }
}

async function findOne(req:Request, res: Response){
  try {
    const id = Number.parseInt(req.params.id)
    const carpeta = await em.findOneOrFail(Carpeta, { id }, {populate :['evidencias.multas']})
    res.status(200).json({message: 'find one carpeta', data : carpeta})
  } catch (error : any) {
    res.status(500).json({error:error.message})
  }
}

// actualizar estado
async function updateEstado(req:Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const { estado } = req.body.sanitizedInput ?? req.body;

    if (!estado) {
      return res.status(400).json({ message: 'Estado es requerido' });
    }

    const est = estado.toUpperCase();
    const validStates = ['ACTIVA', 'PENDIENTE', 'CERRADA', 'APROBADA', 'RECHAZADA'];
    if (!validStates.includes(est)) {
      return res.status(400).json({ message: `Estado inválido. Debe ser uno de: ${validStates.join(', ')}` });
    }

    const carpeta = await em.findOneOrFail(Carpeta, { id }, { populate: ['metahumano'] });
    const estadoAnterior = carpeta.estado;
    carpeta.estado = est;

    if (est === 'APROBADA' && estadoAnterior !== 'APROBADA') {
      const tipo = (carpeta.tipo || '').toUpperCase();
      
      if (tipo === 'CAPTURA_VILLANO' && carpeta.metahumano) {
        await em.getConnection().execute(
          "UPDATE metahumano SET estado = 'capturado', fecha_captura = ? WHERE id = ? AND tipo_meta = 'villano'",
          [new Date(), carpeta.metahumano.id]
        );
      } else if (tipo === 'TRAMITE_REHABILITACION' && carpeta.metahumano) {
        // Verificar que no tenga multas impagas antes de aprobar la rehabilitación
        const multas = await em.find(Multa, {
          evidencia: {
            carpeta: {
              metahumano: { id: carpeta.metahumano.id }
            }
          }
        });
        const unpaidMultas = multas.filter(m => m.estado !== 'PAGADA' && m.estado !== 'RECHAZADA');
        if (unpaidMultas.length > 0) {
          return res.status(400).json({
            message: 'No se puede aprobar el trámite de rehabilitación: el metahumano registra multas sin pagar.'
          });
        }

        await em.getConnection().execute(
          "UPDATE metahumano SET tipo_meta = 'heroe', estado = 'rehabilitado', nivel_fama = 'Bajo', estatus = 'activo', numero_victorias = 0 WHERE id = ?",
          [carpeta.metahumano.id]
        );
      }
    }

    await em.flush();

    return res.status(200).json({
      message: 'Estado de carpeta actualizado exitosamente',
      data: { id: carpeta.id, estado: carpeta.estado },
    });
  } catch (e:any) {
    console.error('Error al actualizar estado de carpeta:', e);
    return res.status(500).json({ message: e.message });
  }
}




async function LinkCarpBuro(req: Request, res: Response) {
  try {

    const { burocrataId, metahumanoId, ...rest } = req.body.sanitizedInput ?? {};

    if (!burocrataId || !metahumanoId) {
      return res.status(400).json({ error: 'burocrataId y metahumanoId son requeridos' });
    }
    
    const nuevaCarpeta = em.create(Carpeta, {
      ...rest,
    });


    nuevaCarpeta.burocrata  = em.getReference(Burocrata,  Number(burocrataId));
    nuevaCarpeta.metahumano = em.getReference(Metahumano, Number(metahumanoId));
    await em.persistAndFlush(nuevaCarpeta);

    const carpetaPopulada = await em.findOneOrFail(
      Carpeta,
      { id: nuevaCarpeta.id },
      { populate: ['burocrata', 'metahumano', 'evidencias.multas'] }
    );

    console.log("Carpeta guardada:", nuevaCarpeta);

    res.status(201).json({
      message: "Carpeta creada correctamente",
      data: carpetaPopulada ,
    });
  } catch (error: any) {
    console.error("Error al crear carpeta:", error);
    res.status(500).json({ error: error.message });
  }
}




async function remove(req:Request, res:Response){
  try {
    const id = Number.parseInt(req.params.id)
    const carpetaToDelete = em.getReference(Carpeta,  id )
    await em.removeAndFlush(carpetaToDelete)
    res.status(200).json({message : 'Carpeta has been eliminated' })
  } catch (error : any) {
    res.status(500).json({error:error.message})
  }
}


export {findOne, findAll, remove, LinkCarpBuro, sanitizeCarpetaInput, updateEstado, getCarpetasByMetahumano}