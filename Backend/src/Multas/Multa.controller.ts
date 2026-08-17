import { orm } from "../shared/db/orm.js";
import { Request, Response, NextFunction } from "express";
import { Multa } from "./Multa.entity.js";
import { Evidencia } from "../evidencia/evidencia.entity.js";

const em = orm.em

function sanitizeMultasInput(req:Request , res:Response, next:NextFunction){
    req.body.sanitizedInput = {
        motivoMulta:req.body.motivoMulta,
        montoMulta:req.body.montoMulta,
        lugarDePago:req.body.lugarDePago,
        fechaEmision:req.body.fechaEmision,
        estado:req.body.estado,
        fechaVencimiento:req.body.fechaVencimiento,
        evidenciaId : req.body.evidenciaId
    }

    Object.keys(req.body.sanitizedInput).forEach(key=>{
        if(req.body.sanitizedInput[key]===undefined){
            delete req.body.sanitizedInput[key]
        }
        })
        next()
}

async function findAll(req:Request, res:Response){
    try {
        const multas = await em.find(Multa, {}, {
            populate: ['evidencia', 'evidencia.carpeta', 'evidencia.carpeta.metahumano']
        })
        res.status(200).json({message : "find all multas" , data : multas})
    } catch(error : any){
        res.status(500).json({message : error.message})
    }
}


async function findOne(req:Request,res:Response){
    try {
        const id = Number.parseInt(req.params.id)
        const multa = await em.findOneOrFail(Multa, { id })
        res.status(200).json({ message: 'find one multa', data: multa })
      } catch (error: any) {
        res.status(500).json({ message: error.message })
      }
}

async function add(req:Request,res:Response){
    try{
        const { evidenciaId, ...sanitizedInput} = req.body
        const nuevaMulta = em.create(Multa, sanitizedInput)
        if(!evidenciaId){
            return res.status(400).json({message : "Evidencia id is required"})
        }else{
            const evidencia = await em.findOneOrFail(Evidencia, { id : evidenciaId})
            if(!evidencia){
                return res.status(404).json({message: "evidencia not found"})
            }else {
                // Validar que no exista una multa con el mismo motivo y monto para esta evidencia
                const existingMulta = await em.findOne(Multa, {
                    evidencia: evidenciaId,
                    motivoMulta: nuevaMulta.motivoMulta,
                    montoMulta: nuevaMulta.montoMulta
                })
                if (existingMulta) {
                    return res.status(400).json({ message: "Ya existe una multa registrada con el mismo motivo y monto para esta evidencia" })
                }

                if (nuevaMulta.fechaEmision > nuevaMulta.fechaVencimiento) {
                    throw new Error("La fecha de emisión no puede ser posterior al vencimiento");
                }
                nuevaMulta.evidencia = evidencia;
                await em.flush();
            }
        }
        res.status(201).json({ message: 'multa created', data: nuevaMulta })
    } catch (error: any) {
    res.status(500).json({ message: error.message })
    }
}

async function update(req:Request,res:Response){
    try {
        const id = Number.parseInt(req.params.id)
        const multaToUpdate = await em.findOneOrFail(Multa, { id })
        em.assign(multaToUpdate, req.body.sanitizedInput)
        await em.flush()

        // Recalcular la recompensa del villano si corresponde
        try {
          const populatedMulta = await em.findOne(Multa, { id }, {
            populate: ['evidencia', 'evidencia.carpeta', 'evidencia.carpeta.metahumano']
          })
          
          if (populatedMulta?.evidencia?.carpeta?.metahumano) {
            const metahumano = populatedMulta.evidencia.carpeta.metahumano
            if (metahumano.tipoMeta === 'villano') {
              const multas = await em.find(Multa, {
                evidencia: {
                  carpeta: {
                    metahumano: { id: metahumano.id }
                  }
                }
              })
              
              const unpaidMultas = multas.filter(m => m.estado === 'APROBADA')
              const expiredMultas = multas.filter(m => m.estado === 'APROBADA' && m.fechaVencimiento && new Date(m.fechaVencimiento) < new Date())
              
              let recompensa = 0
              if (unpaidMultas.length > 0 || expiredMultas.length >= 2) {
                recompensa = unpaidMultas.reduce((acc, m) => acc + (m.montoMulta || 0), 0)
              }
              
              await em.getConnection().execute(
                'UPDATE metahumano SET recompensa = ? WHERE id = ?',
                [recompensa, metahumano.id]
              )
            }
          }
        } catch (recompensaErr) {
          console.error('Error al actualizar recompensa de villano al modificar multa:', recompensaErr)
        }

        res.status(200).json({ message: 'multa updated', data: multaToUpdate })
      } catch (error: any) {
        res.status(500).json({ message: error.message })
      }
}



async function remove(req:Request,res:Response){
     try {
        const id = Number.parseInt(req.params.id)
        const multa = await em.findOne(Multa, { id }, {
          populate: ['evidencia', 'evidencia.carpeta', 'evidencia.carpeta.metahumano']
        })
        
        if (multa) {
          const metahumano = multa.evidencia?.carpeta?.metahumano
          await em.removeAndFlush(multa)
          
          if (metahumano && metahumano.tipoMeta === 'villano') {
            const multas = await em.find(Multa, {
              evidencia: {
                carpeta: {
                  metahumano: { id: metahumano.id }
                }
              }
            })
            
            const unpaidMultas = multas.filter(m => m.estado === 'APROBADA')
            const expiredMultas = multas.filter(m => m.estado === 'APROBADA' && m.fechaVencimiento && new Date(m.fechaVencimiento) < new Date())
            
            let recompensa = 0
            if (unpaidMultas.length > 0 || expiredMultas.length >= 2) {
              recompensa = unpaidMultas.reduce((acc, m) => acc + (m.montoMulta || 0), 0)
            }
            
            await em.getConnection().execute(
              'UPDATE metahumano SET recompensa = ? WHERE id = ?',
              [recompensa, metahumano.id]
            )
          }
        }
        res.status(200).json({ message: 'multa deleted' })
      } catch (error: any) {
        res.status(500).json({ message: error.message })
      }
}

async function pagarMulta(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de multa inválido' })
    }

    const authedReq = req as any
    const metahumanoId = authedReq.perfilId

    if (!metahumanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil de metahumano asociado' })
    }

    const formaPago = req.body?.formaPago || req.body?.metodoPago || req.body?.formaDePago || 'AstroPay';

    const multa = await em.findOneOrFail(Multa, { id }, {
      populate: ['evidencia.carpeta.metahumano']
    })

    // Verificar que la multa pertenece al metahumano logueado
    if (multa.evidencia?.carpeta?.metahumano?.id !== metahumanoId) {
      return res.status(403).json({ message: 'Acceso denegado: esta multa no te pertenece' })
    }

    if (multa.estado === 'PAGADA') {
      return res.status(400).json({ message: 'La multa ya se encuentra pagada' })
    }

    multa.estado = 'PAGADA'
    multa.formaPago = formaPago
    await em.flush()

    // Recalcular la recompensa del villano tras el pago
    try {
      const metahumano = multa.evidencia.carpeta.metahumano
      if (metahumano && metahumano.tipoMeta === 'villano') {
        const multas = await em.find(Multa, {
          evidencia: {
            carpeta: {
              metahumano: { id: metahumano.id }
            }
          }
        })
        
        const unpaidMultas = multas.filter(m => m.estado === 'APROBADA')
        const expiredMultas = multas.filter(m => m.estado === 'APROBADA' && m.fechaVencimiento && new Date(m.fechaVencimiento) < new Date())
        
        let recompensa = 0
        if (unpaidMultas.length > 0 || expiredMultas.length >= 2) {
          recompensa = unpaidMultas.reduce((acc, m) => acc + (m.montoMulta || 0), 0)
        }
        
        await em.getConnection().execute(
          'UPDATE metahumano SET recompensa = ? WHERE id = ?',
          [recompensa, metahumano.id]
        )
      }
    } catch (recompensaErr) {
      console.error('Error al actualizar recompensa de villano al pagar multa:', recompensaErr)
    }

    res.status(200).json({ message: 'Multa pagada exitosamente', data: multa })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function crearPreferenciaMPAdmin(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de multa inválido' })
    }

    const authedReq = req as any
    const metahumanoId = authedReq.perfilId

    if (!metahumanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil de metahumano asociado' })
    }

    const multa = await em.findOneOrFail(Multa, { id }, {
      populate: ['evidencia.carpeta.metahumano']
    })

    if (multa.evidencia?.carpeta?.metahumano?.id !== metahumanoId) {
      return res.status(403).json({ message: 'Acceso denegado: esta multa no te pertenece' })
    }

    if (multa.estado === 'PAGADA') {
      return res.status(400).json({ message: 'La multa ya se encuentra pagada' })
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN || '';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const preferenceBody = {
      items: [
        {
          id: `MULTA-${multa.id}`,
          title: `Multa #${multa.id} - ${multa.motivoMulta}`,
          description: `Cobro oficial de multa por ${multa.motivoMulta}`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: Math.max(1, Number(multa.montoMulta) || 100)
        }
      ],
      back_urls: {
        success: `${frontendUrl}/metahumano/carpetas?status=success&multa_id=${multa.id}`,
        failure: `${frontendUrl}/metahumano/carpetas?status=failure&multa_id=${multa.id}`,
        pending: `${frontendUrl}/metahumano/carpetas?status=pending&multa_id=${multa.id}`
      },
      external_reference: `MULTA-${multa.id}`
    };

    let initPoint = '';
    let sandboxInitPoint = '';
    let preferenceId = '';
    let checkoutUrl = '';

    if (mpAccessToken && !mpAccessToken.includes('TU_ACCESS_TOKEN')) {
      console.log('[MP] Token prefix:', mpAccessToken.substring(0, 8));
      console.log('[MP] Body enviado a MP:', JSON.stringify(preferenceBody, null, 2));
      try {
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mpAccessToken}`
          },
          body: JSON.stringify(preferenceBody)
        });

        const mpData = await response.json();
        console.log('[MP] HTTP Status:', response.status);
        console.log('[MP] Respuesta de MP:', JSON.stringify(mpData, null, 2));

        if (response.ok) {
          initPoint = mpData.init_point;
          sandboxInitPoint = mpData.sandbox_init_point || mpData.init_point;
          preferenceId = mpData.id;
          checkoutUrl = mpAccessToken.startsWith('TEST-') ? sandboxInitPoint : initPoint;
          console.log('[MP] ✅ Preferencia creada OK. checkoutUrl:', checkoutUrl);
        } else {
          console.error('[MP] ❌ Error de MP API:', mpData);
        }
      } catch (mpErr) {
        console.error('[MP] ❌ Error de red al llamar a MP:', mpErr);
      }
    } else {
      console.warn('[MP] ⚠️ Token no configurado o es placeholder. Se usará URL de fallback.');
    }

    if (!checkoutUrl) {
      console.warn('[MP] ⚠️ USANDO URL FALSA DE FALLBACK — esto significa que la llamada a MP falló.');
      preferenceId = `PREF-${Date.now()}-${multa.id}`;
      sandboxInitPoint = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
      initPoint = sandboxInitPoint;
      checkoutUrl = sandboxInitPoint;
    }

    res.status(200).json({
      message: 'Preferencia de pago creada para la cuenta del Admin',
      data: {
        preferenceId,
        checkoutUrl,
        initPoint,
        sandboxInitPoint,
        multaId: multa.id,
        monto: multa.montoMulta,
        motivo: multa.motivoMulta
      }
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function verificarPagoMP(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: 'ID de multa inválido' })

    const authedReq = req as any
    const metahumanoId = authedReq.perfilId
    if (!metahumanoId) return res.status(400).json({ message: 'El usuario no tiene perfil de metahumano' })

    const multa = await em.findOneOrFail(Multa, { id }, { populate: ['evidencia.carpeta.metahumano'] })

    if (multa.evidencia?.carpeta?.metahumano?.id !== metahumanoId) {
      return res.status(403).json({ message: 'Acceso denegado: esta multa no te pertenece' })
    }
    if (multa.estado === 'PAGADA') {
      return res.status(200).json({ message: 'La multa ya estaba pagada', alreadyPaid: true })
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN || ''
    if (!mpAccessToken || mpAccessToken.includes('TU_ACCESS_TOKEN')) {
      return res.status(400).json({ message: 'MP no configurado' })
    }

    // Buscar en MP un pago aprobado con el external_reference de esta multa
    const searchRes = await fetch(
      `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&external_reference=MULTA-${id}`,
      { headers: { Authorization: `Bearer ${mpAccessToken}` } }
    )
    const searchData = await searchRes.json()
    console.log('[MP Verify] Resultados para MULTA-' + id + ':', JSON.stringify(searchData?.results?.map((p: any) => ({ id: p.id, status: p.status }))))

    const approvedPayment = searchData.results?.find((p: any) => p.status === 'approved')

    if (!approvedPayment) {
      return res.status(400).json({ message: 'No se encontró un pago aprobado en Mercado Pago para esta multa. Si ya pagaste, esperá unos segundos e intentá de nuevo.' })
    }

    // Pago confirmado por MP → marcar como PAGADA
    multa.estado = 'PAGADA'
    multa.formaPago = 'Mercado Pago'
    await em.flush()

    // Recalcular recompensa del villano si corresponde
    try {
      const metahumano = multa.evidencia.carpeta.metahumano
      if (metahumano?.tipoMeta === 'villano') {
        const multas = await em.find(Multa, { evidencia: { carpeta: { metahumano: { id: metahumano.id } } } })
        const unpaidMultas = multas.filter(m => m.estado === 'APROBADA')
        const recompensa = unpaidMultas.length > 0 ? unpaidMultas.reduce((acc, m) => acc + (m.montoMulta || 0), 0) : 0
        await em.getConnection().execute('UPDATE metahumano SET recompensa = ? WHERE id = ?', [recompensa, metahumano.id])
      }
    } catch (e) { console.error('Error recalculando recompensa:', e) }

    res.status(200).json({ message: 'Pago verificado y multa marcada como PAGADA', data: multa })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeMultasInput, findAll, findOne, add, update, remove, pagarMulta, crearPreferenciaMPAdmin, verificarPagoMP }