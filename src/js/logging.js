export const DEBUG = 1;
export const INFO = 2;
export const WARNING = 3;
export const ERROR = 4;

const LEVEL_NAMES = {
  [DEBUG]: 'debug',
  [INFO]: 'info',
  [WARNING]: 'warning',
  [ERROR]: 'error',
};

export class Logger {
  constructor(level = INFO, handler = null) {
    this.level = level;
    this.handler = handler || new ConsoleHandler();
  }

  log(level, ...message) {
    if (level < this.level) {
      return;
    }

    message = message.join('');

    this.handler.write(level, message);
  }

  debug(...message) {
    return this.log(DEBUG, message);
  }

  info(...message) {
    return this.log(INFO, message);
  }

  warn(...message) {
    return this.log(WARNING, message);
  }

  error(...message) {
    return this.log(ERROR, message);
  }
}

class Handler {
  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  prepareRecord(level, message) {
    throw new TypeError('Function is not implemented');
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  write(level, message) {
    throw new TypeError('Function is not implemented');
  }
}

export class ConsoleHandler extends Handler {
  /* eslint-disable no-console */
  static LOG_FUNCTIONS = {
    [DEBUG]: console.debug.bind(console),
    [INFO]: console.info.bind(console),
    [WARNING]: console.warn.bind(console),
    [ERROR]: console.error.bind(console),
  };
  /* eslint-enable no-console */

  constructor(format) {
    super();

    // format options: "{level}", "{date}", "{time}", "{message}"
    this.format = format || '{time} [{level}] {message}';
  }

  prepareRecord(level, message) {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    return this.format
      .replace('{level}', LEVEL_NAMES[level])
      .replace('{date}', date)
      .replace('{time}', time)
      .replace('{message}', message);
  }

  write(level, message) {
    const record = this.prepareRecord(level, message);
    const logFunc = ConsoleHandler.LOG_FUNCTIONS[level];

    logFunc(record);
  }
}

export const globalLogger = new Logger(DEBUG, new ConsoleHandler());
