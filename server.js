import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import todoRouters from "./routes/todo.js";
import userRouters from "./routes/user.js";
import authRouters from "./routes/auth.js";
import { URL } from "./utilities/constants.js";
import passport from "passport";
import { googleStrategy } from "./middlewares/auth.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const server = express();
server.use(bodyParser.json());
passport.use(googleStrategy());
server.use("/uploads", express.static(path.join(__dirname, "uploads")));
server.use(cors({ orgin: process.env.CLIENT_HOST_URL }));
server.use(`${URL}/auth`, authRouters);
server.use(`${URL}/todos`, todoRouters);
server.use(`${URL}/users`, userRouters);

server.get(`${URL}/healthcheck`, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server health is good",
  });
});

export default server;
