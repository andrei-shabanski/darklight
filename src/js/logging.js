import { inherit } from './utils';

export const DEBUG = 1;
export const INFO = 2;
export const WARNING = 3;
export const ERROR = 4;

const LEVEL_NAMES = {
    [DEBUG]: 'debug',
    [INFO]: 'info',
    [WARNING]: 'warning',
    [ERROR]: 'error'
};


export function Logger(level, handler) {
    this.level = level;
    this.handler = handler;
}

Logger.prototype.log = function(level, args) {
    if (level < this.level) {
        return
    }

    var text = [].join.bind(args)('');

    this.handler.write(level, text);
};

Logger.prototype.debug = function() {
    return this.log(DEBUG, arguments);
};

Logger.prototype.info = function() {
    return this.log(INFO, arguments);
};

Logger.prototype.warn = function() {
    return this.log(WARNING, arguments);
};

Logger.prototype.error = function() {
    return this.log(ERROR, arguments);
};


export function LoggerHandler(format) {
    // format attributes: "{level}", "{date}", "{time}", "{message}"
    this.format = format || '[{level}] {time} {message}';
}

LoggerHandler.prototype.prepareLog = function(level, message) {
    var now = new Date();
    var date = now.toLocaleDateString();
    var time = now.toLocaleTimeString();

    return this.format
        .replace('{level}', LEVEL_NAMES[level])
        .replace('{date}', date)
        .replace('{time}', time)
        .replace('{message}', message);
};

LoggerHandler.prototype.write = function(level, message) {}


export function ConsoleHandler(format) {
    ConsoleHandler.super.constructor.apply(this, arguments);
}

ConsoleHandler.LOG_FUNCTIONS = {
    [DEBUG]: console.debug.bind(console),
    [INFO]: console.info.bind(console),
    [WARNING]: console.warn.bind(console),
    [ERROR]: console.error.bind(console)
};

inherit(ConsoleHandler, LoggerHandler);

ConsoleHandler.prototype.write = function(level, message) {
    var log = this.prepareLog(level, message);
    var logFunc = ConsoleHandler.LOG_FUNCTIONS[level];

    logFunc(log);
};
