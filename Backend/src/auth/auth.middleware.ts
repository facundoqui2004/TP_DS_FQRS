import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { orm } from '../shared/db/orm.js';
import { Metahumano } from '../metahumano/metahumano.entity.js';
import { config } from '../config/environment.js';

export interface AuthedRequest extends Request {
  usuarioId?: number;
  role?: string;
  perfil?: string;
  perfilId?: number;
  tokenPayload?: any;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.auth_token;

    // Soportar también header Authorization: Bearer <token>
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'No autenticado (falta auth_token o token Bearer)' });
    }

    const payload = jwt.verify(token, config.jwtSecret) as any;

    (req as AuthedRequest).usuarioId = payload.usuarioId;
    (req as AuthedRequest).role      = payload.role;
    (req as AuthedRequest).perfil    = payload.perfil;
    (req as AuthedRequest).perfilId  = payload.perfilId;
    (req as AuthedRequest).tokenPayload = payload;

    if (!payload.usuarioId) {
      return res.status(400).json({ message: 'Token sin usuarioId' });
    }

    next();
  } catch (err: any) {
    return res.status(401).json({ message: 'Token inválido o expirado', error: err.message });
  }
}

export function requireRoles(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authedReq = req as AuthedRequest;
      if (!authedReq.usuarioId) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      const roleUpper = (authedReq.role || '').toUpperCase();
      const allowedUpper = allowedRoles.map(r => r.toUpperCase());

      // Si el rol de usuario directo está permitido
      if (allowedUpper.includes(roleUpper)) {
        return next();
      }

      // Si es METAHUMANO, verificar su subtipo (Heroe o Villano) en BD
      if (authedReq.role === 'METAHUMANO' && authedReq.perfilId) {
        const em = orm.em;
        const metahumano = await em.findOne(Metahumano, { id: authedReq.perfilId });
        if (metahumano) {
          const tipo = metahumano.tipoMeta.toUpperCase(); // HEROE o VILLANO
          if (allowedRoles.includes(tipo)) {
            return next();
          }
        }
      }

      return res.status(403).json({ message: 'Acceso denegado: rol o permisos insuficientes' });
    } catch (err: any) {
      next(err);
    }
  };
}
