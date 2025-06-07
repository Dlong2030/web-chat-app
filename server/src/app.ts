import express, { Request, Response } from 'express';
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import { healthCheck } from './config/database';
import { authRoutes } from './routes/auth.routes';

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
// app.use(morgan('combined'));
// app.use(morgan('common'));

// Routes
app.use('/api/v1/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Express + TypeScript!');
});

app.get('/health', async (req, res) => {
    try {
        const result = await healthCheck();
        res.json(result);
    } catch (err) {
        res.status(500).json({ status: 'unhealthy', error: (err as Error).message });
    }
});
export default app;