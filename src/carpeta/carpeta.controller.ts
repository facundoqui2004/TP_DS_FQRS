import { Request, Response,NextFunction } from "express";
import { Carpeta } from "./carpeta.entity.js";
import { orm } from "../shared/db/orm.js";
import { Burocrata } from "../Burocratas/Burocrata.entity.js";


const em = orm.em


  function sanitizeCarpetaInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
      estado : req.body.estado,
      tipo: req.body.tipo,
      descripcion: req.body.descripcion,
      burocrataId: req.body.burocrataId
    }
    

    // Eliminar claves undefined
    Object.keys(req.body.sanitizedInput).forEach((key) => {
      if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key]
      }
    })

    next()
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


async function LinkCarpBuro(req: Request, res: Response) {
  try {

    const { burocrataId, ...sanitizedInput } = req.body.sanitizedInput;
    console.log("📌 Datos finales que se usan para crear carpeta:", sanitizedInput);

    const nuevaCarpeta = em.create(Carpeta, sanitizedInput);
    if (burocrataId) {
      const burocrata = await em.findOne(Burocrata, { id: Number(burocrataId) });
      if (!burocrata) {
        return res.status(404).json({ message: "Burocrata not found" });
      }
      nuevaCarpeta.burocrata = burocrata;
    }

    // 🚨 Agregamos log antes y después de persistir
    console.log("📝 Guardando carpeta en la base de datos...");
    await em.persistAndFlush(nuevaCarpeta);
    console.log("✅ Carpeta guardada:", nuevaCarpeta);

    res.status(201).json({
      message: "✅ Carpeta creada correctamente",
      data: nuevaCarpeta,
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


export {findOne, findAll, remove, LinkCarpBuro, sanitizeCarpetaInput}

  