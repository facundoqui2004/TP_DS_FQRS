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
  const message = err.message || 'Error interno del servidor'

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  })
}
