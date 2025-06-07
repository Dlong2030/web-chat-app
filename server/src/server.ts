import app from './app';
import http from 'http';
import { connectDB } from './config/database';
import logger from './utils/logger';

const PORT = process.env.SERVER_PORT || 5000;
// Start the server
const startServer = async () => {
    try {
        await connectDB(); // Kết nối MongoDB

        const server = http.createServer(app);

        server.listen(PORT, () => {
            logger.info(`Server listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${(error as Error).message}`);
        process.exit(1);
    }
};

startServer();
