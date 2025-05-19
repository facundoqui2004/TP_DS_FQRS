import { MongoClient } from "mongodb";

const username = encodeURIComponent("facundoq654");
const password = encodeURIComponent("F32ut65");
const cluster = "test.vobbqgk.mongodb.net"; // tu cluster en Atlas
const dbName = "nodejsp";
const collName = "users";

const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB Atlas!");

    const database = client.db(dbName);
    const collection = database.collection(collName);

    const cursor = collection.find();

    await cursor.forEach(doc => console.log(doc));
  } catch (err) {
    console.error("Error conectando a la base:", err);
  } finally {
    await client.close();
    console.log("Conexión cerrada");
  }
}

run();
