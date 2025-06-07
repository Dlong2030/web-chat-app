import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'info', // các mức: error, warn, info, http, verbose, debug, silly
    format: format.combine(
        format.colorize(),              // Tô màu theo level
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),       // Log ra console
        // new transports.File({ filename: 'logs/error.log', level: 'error' }), // Ghi file nếu cần
        // new transports.File({ filename: 'logs/combined.log' }),
    ],
});

export default logger;
