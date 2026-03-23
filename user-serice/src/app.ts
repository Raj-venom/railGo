import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { corsMiddleware } from "./middlewares/cors.middlware";
import { handleError } from "./middlewares/handleError.middleware";
import requestLogger from "./middlewares/req.middleware";


const app = express();

app.use(helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(corsMiddleware);
app.use(requestLogger);
app.use(express.json());
app.use(cookieParser());



// Router import 
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";



//routes declaration
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);



app.get("/healthcheck", (req, res) => {
    res.status(200).json({
        message: "ok"
    })
})

app.use("*splat", (req, res) => {
    return res.status(404).json({ message: "Resource not found" })
});

// handle error
app.use(handleError);

export default app;