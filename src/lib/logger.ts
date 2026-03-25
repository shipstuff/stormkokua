const isDev = process.env.NODE_ENV !== "production";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  msg: string;
  [key: string]: unknown;
}

function write(entry: LogEntry) {
  const ts = new Date().toISOString();
  if (isDev) {
    const { level, msg, ...rest } = entry;
    const extra = Object.keys(rest).length
      ? " " + JSON.stringify(rest)
      : "";
    const prefix = level === "error" ? "ERR" : level === "warn" ? "WRN" : "INF";
    // eslint-disable-next-line no-console
    console.log(`${ts} [${prefix}] ${msg}${extra}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ts, ...entry }));
  }
}

export const log = {
  info(msg: string, data?: Record<string, unknown>) {
    write({ level: "info", msg, ...data });
  },
  warn(msg: string, data?: Record<string, unknown>) {
    write({ level: "warn", msg, ...data });
  },
  error(msg: string, data?: Record<string, unknown>) {
    write({ level: "error", msg, ...data });
  },
};
