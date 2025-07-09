import crypto from "node:crypto";

export class Burocrata {
  constructor(
    public idUsuario = crypto.randomUUID(),
    public passwordHash:string,
    public fechaRegistro:string,
    public direccion:string
  ){}
};