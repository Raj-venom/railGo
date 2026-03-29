import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";


import {config} from "./config";
import logger from "./config/logger";


const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());




dotenv.config();