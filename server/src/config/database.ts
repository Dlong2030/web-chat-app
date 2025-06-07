import mongoose, { Connection, ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

interface DatabaseOptions extends ConnectOptions {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    maxPoolSize: number;
    heartbeatFrequencyMS: number;
}

export interface ConnectionResult {
    connection: Connection;
    host: string;
    databaseName: string;
    status: string;
}

export enum ConnectionState {
    DISCONNECTED = 0,
    CONNECTED = 1,
    CONNECTING = 2,
    DISCONNECTING = 3
}

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private connection: Connection | null = null;
    private readonly mongoURI: string;
    private readonly options: DatabaseOptions;

    private constructor() {
        this.mongoURI = process.env.MONGODB_URI || 'mongodb+srv://dinhlong366:WtyKpNuSo0VZvvNd@pandachatv1.p4xzyeu.mongodb.net/panda-db?retryWrites=true&w=majority';
        this.options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            heartbeatFrequencyMS: 10000,
        };
    }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public async connect(): Promise<ConnectionResult> {
        try {
            logger.info('🔄 Connecting to MongoDB...');
            const conn = await mongoose.connect(this.mongoURI, this.options);
            this.connection = conn.connection;

            logger.info(`MongoDB Connected: ${conn.connection.host}`);
            logger.info(`Database Name: ${conn.connection.name}`);

            this.setupEventListeners();
            this.setupGracefulShutdown();

            return {
                connection: conn.connection,
                host: conn.connection.host,
                databaseName: conn.connection.name,
                status: 'connected'
            };

        } catch (error) {
            logger.error('MongoDB connection error:', (error as Error).message);
            throw new Error(`Database connection failed: ${(error as Error).message}`);
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this.connection) {
                await mongoose.connection.close();
                logger.info('MongoDB connection closed');
                this.connection = null;
            }
        } catch (error) {
            logger.error('Error closing MongoDB connection:', (error as Error).message);
            throw error;
        }
    }

    public getConnectionState(): { state: string; isConnected: boolean } {
        const state = mongoose.connection.readyState;
        const states: Record<number, string> = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting',
        };

        return {
            state: states[state] || 'Unknown',
            isConnected: state === 1,
        };
    }

    public async healthCheck(): Promise<{ status: string; latency: number; timestamp: string }> {
        try {
            const start = Date.now();
            if (!mongoose.connection.db) {
                throw new Error('Database not initialized yet');
            }
            await mongoose.connection.db.admin().ping();
            const latency = Date.now() - start;

            return {
                status: 'healthy',
                latency,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Database health check failed: ${(error as Error).message}`);
        }
    }

    public getConnection(): Connection | null {
        return this.connection;
    }

    private setupEventListeners(): void {
        mongoose.connection.on('connected', () => {
            logger.info('Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err: Error) => {
            logger.error('Mongoose connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('Mongoose disconnected from MongoDB');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('Mongoose reconnected to MongoDB');
        });
    }

    private setupGracefulShutdown(): void {
        const gracefulShutdown = async (signal: string): Promise<void> => {
            logger.info(`\nReceived ${signal}. Closing MongoDB connection...`);
            try {
                await this.disconnect();
                logger.info('MongoDB connection closed gracefully');
                process.exit(0);
            } catch (error) {
                logger.error('Error during graceful shutdown:', error);
                process.exit(1);
            }
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
    }
}

export const dbConnection = DatabaseConnection.getInstance();

export const connectDB = async (): Promise<ConnectionResult> => {
    return await dbConnection.connect();
};

export const disconnectDB = async (): Promise<void> => {
    return await dbConnection.disconnect();
};

export const checkConnection = (): { state: string; isConnected: boolean } => {
    return dbConnection.getConnectionState();
};

export const healthCheck = async (): Promise<{ status: string; latency: number; timestamp: string }> => {
    return await dbConnection.healthCheck();
};

export default dbConnection;
