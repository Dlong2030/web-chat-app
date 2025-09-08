import express, { Request, Response } from 'express';
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { healthCheck } from './config/database';
import session from 'express-session';
import passport from 'passport';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import logger from './utils/logger';
import { authRoutes } from './routes/auth.routes';
import { conversationRoutes } from './routes/conversation.routes';
import { userRoutes } from './routes/user.routes';

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
app.use(cookieParser());
app.use(morgan('dev'));
// app.use(morgan('combined'));
// app.use(morgan('common'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/users', userRoutes);

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

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;