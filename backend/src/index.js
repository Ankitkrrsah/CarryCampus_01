import dotenv from "dotenv";
import { app } from "./app.js";
import { pool } from "./db/db.js";

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8000;

pool.connect()
    .then((client) => {
        console.log("PostgreSQL Connected !!");
        client.release();

        app.listen(PORT, () => {
            console.log(`Server is running at port : ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("PostgreSQL Connection Failed !!! ", err);
    });