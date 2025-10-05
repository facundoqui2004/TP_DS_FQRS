import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_aqui';

export interface AuthedRequest extends Request {
  usuarioId?: number;
  role?: string;
  perfil?: string;
  perfilId?: number;
  tokenPayload?: any;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ message: 'No autenticado (falta auth_token)' });
    }

    const payload = jwt.verify(token, JWT_SECRET) as any;

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
