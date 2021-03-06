import winston from 'winston'
import { magic8bot } from '../conf'
import * as Transport from 'winston-transport'
import DailyRotateFile from 'winston-daily-rotate-file'

function* getWinstonTransports(): IterableIterator<Transport> {
    const fileLogger = isFileLoggerAvailable()
    if (fileLogger) {
        yield new DailyRotateFile({
            filename: magic8bot.loggerFile,
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '7d',
        })
    }

    if (process.env.NODE_ENV === 'development' || !fileLogger) {
        yield new winston.transports.Console({
            format: formatter,
        })
    }
}

const textFormat = winston.format.printf((info) => {
    return `${info.timestamp} [${info.level.padStart(5, ' ')}]: ${info.message}`
})

const formatter = winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    winston.format.simple(),
    textFormat
)

const isFileLoggerAvailable = () => {
    return magic8bot.loggerFile && magic8bot.loggerFile.length > 0
}

export const logger = winston.createLogger({
    level: magic8bot.loggerLevel,
    format: formatter,
    transports: Array.from(getWinstonTransports()),
})
