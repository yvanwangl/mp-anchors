class Logger {
    info(tag: string, msg: string): void {
        console.info(tag, msg);
    }

    warn(tag: string, msg: string): void {
        console.warn(tag, msg);
    }

    error(tag: string, msg: string): void {
        console.warn(tag, msg);
    }
}

export default new Logger();