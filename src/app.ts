import express from 'express';
import metahumanoRoutes from './routes/meta.routes.js';
import  poderRoutes  from './routes/poder.routes.js';

const app = express();
app.use(express.json());

app.use("/metahumanos", metahumanoRoutes);
app.use("/poderes", poderRoutes);

app.get("/", (req, res) => res.send("Hello World"));

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});






























/*
// /src/app.ts
import express, { NextFunction, Request, Response } from 'express';

import { Metahumano } from './models/metahumano.model.js';
import metahumanoRoutes from './routes/meta.routes.js';

export const app = express();
app.use(express.json());


// Monta las rutas
app.use("/metahumanos", metahumanoRoutes);


// Ruta raíz
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Escucha
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});*/