import express from 'express';
import metahumanoRoutes from './routes/meta.routes.js';
import poderRoutes from './routes/poder.routes.js';
const app = express();
app.use(express.json());
app.use("/metahumanos", metahumanoRoutes);
app.use("/poderes", poderRoutes);
app.get("/", (req, res) => res.send("Hello World"));
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
//# sourceMappingURL=app.js.map