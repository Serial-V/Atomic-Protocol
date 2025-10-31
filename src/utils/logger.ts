import chalk from "chalk";
import gradient from "gradient-string";

export class Logger {
    private static tag = "Atomic";

    private static purpleLabel(): string {
        const colors = ["#d6b3ff", "#b57cff", "#8e44ff", "#5a1aff"];
        return gradient(colors)(`[${this.tag}]`);
    }

    private static debugLabel(): string {
        const colors = ["#2d2e2eff", "#494949ff", "rgba(129, 131, 131, 1)", "#c4c3c3ff"];
        return gradient(colors)(`[DEBUG]`);
    }

    private static timestamp(): string {
        const now = new Date().toLocaleString();
        return chalk.gray(now);
    }


    static log(message: string) {
        console.log(`${this.timestamp()} ${this.purpleLabel()} ${chalk.whiteBright(message)}`);
    }

    static warn(message: string) {
        console.warn(`${this.timestamp()} ${this.purpleLabel()} ${chalk.yellow(message)}`);
    }

    static error(message: string) {
        console.error(`${this.timestamp()} ${this.purpleLabel()} ${chalk.redBright(message)}`);
    }

    static success(message: string) {
        console.log(`${this.timestamp()} ${this.purpleLabel()} ${chalk.greenBright(message)}`);
    }

    static debug(message: string, debug = false) {
        if (!debug) return;
        console.log(`${this.timestamp()} ${this.purpleLabel()} ${this.debugLabel()} ${chalk.hex("#a3f3ff")(message)}`);
    }
}
