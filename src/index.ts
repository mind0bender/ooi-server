import express from "express";
import { PORT } from "./utils/const";
import { Server, createServer } from "http";
import ansiColors from "ansi-colors";
import cors from "cors";

const app = express();

// middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.get("/", (req, res) => {
  res.send("Hello world!");
});

export const server: Server = createServer(app);

server.listen(PORT, () => {
  console.log(ansiColors.cyan(`App listening on port *:${PORT}`));
});

import "./io";
