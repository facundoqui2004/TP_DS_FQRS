import { Request, Response, NextFunction } from 'express'

export class CustomError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    Object.setPrototypeOf(this, CustomError.prototype)
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error capturado por middleware centralizado:', err)

  const statusCode = err.statusCode || (err.name === 'NotFoundError' ? 404 : 500)
  // Los errores 500 no son controlados: el detalle queda en el log, no en la respuesta
  const message = statusCode >= 500 ? 'Error interno del servidor' : (err.message || 'Error')

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  })
}
