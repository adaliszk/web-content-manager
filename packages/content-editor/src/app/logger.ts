import type { PrettyOptions } from "pino-pretty";

import chalk from "chalk";
import { format } from "date-fns";
import { levels, pino } from "pino";

export const Logger = pino({
    mixin: (_metadata, level) => {
        let levelColor = chalk.blue;
        if (level >= 30) levelColor = chalk.yellow;
        if (level >= 50) levelColor = chalk.red;
        return {
            prettyTime: chalk.grey(format(new Date(), "HH:mm:ss")),
            prettyLevel: levelColor(`[${levels.labels[level]}]`),
        };
    },
    level: "debug",
    transport: {
        target: "pino-pretty",
        options: {
            messageFormat: `{prettyTime} {prettyLevel} {msg} ${chalk.gray("(in {service})")}`,
            // need to ignore 'filename' otherwise it appears beneath each log
            ignore: "pid,hostname,filename,time,level,service,prettyTime,prettyLevel",
        } satisfies PrettyOptions,
    },
});
