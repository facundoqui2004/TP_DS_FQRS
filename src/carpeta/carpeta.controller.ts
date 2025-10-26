import { Request, Response,NextFunction } from "express";
import { Carpeta } from "./carpeta.entity.js";
import { Metahumano } from '../metahumano/metahumano.entity.js';
import { orm } from "../shared/db/orm.js";
import { Burocrata } from "../Burocratas/Burocrata.entity.js";


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
    const carpetas = await em.find(Carpeta, {metahumano : idMetahumano})
    res.status(200).json({message : 'found carpetas by metahumano', data : carpetas})
  }
  catch(error: any){
    res.status(500).json({message : error.message})
  }
}

async function findAll(req:Request, res:Response){
    try {
    const carpetas = await em.find(Carpeta, {}, {populate :['evidencias.multas']})
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

    if (!estado || !['activa', 'pendiente', 'cerrada'].includes(estado)) {
      return res.status(400).json({ message: 'estado requerido o inválido' });
    }

    const carpeta = await em.findOneOrFail(Carpeta, { id });
    carpeta.estado = estado;
    await em.flush();

    return res.status(200).json({
      message: 'Estado actualizado',
      data: { id: carpeta.id, estado: carpeta.estado },
    });
  } catch (e:any) {
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

    console.log("✅ Carpeta guardada:", nuevaCarpeta);

    res.status(201).json({
      message: "✅ Carpeta creada correctamente",
      data: carpetaPopulada ,
    });
  } catch (error: any) {
    console.error("❌ Error al crear carpeta:", error);
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