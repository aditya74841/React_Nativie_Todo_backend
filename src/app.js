import express from "express";
import { createServer } from "http";
import cors from "cors"
const app = express();

const httpServer = createServer(app);

app.use(
    cors({
      origin: [     
       
        "*"
      ],
     
    })
  );

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally

import todoRouter from "../src/routes/todo.routes.js";

app.use("/api/v1/todo", todoRouter);

export { httpServer };
