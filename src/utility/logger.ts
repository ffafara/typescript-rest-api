import { createLogger, format, transports } from 'winston'
const { combine, timestamp, label, prettyPrint, printf } = format

export class Logger {
  public static myFormat = printf(info => {
    return `[${info.timestamp}] [${info.level}] => ${info.message}`
  })

  public static logger = createLogger({
    format: combine(
      label({ label: 'order-api errors' }),
      timestamp(),
      Logger.myFormat
    ),
    level: 'info',

    transports: [
      new transports.File({ filename: 'aggregated.log' }),
      new transports.Console(),
    ],
  })
}
