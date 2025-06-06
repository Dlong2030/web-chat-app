import express, { Request, Response } from 'express';
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan('dev'));
// app.use(morgan('combined '));
// app.use(morgan('common'));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Express + TypeScript!');
});

export default app;