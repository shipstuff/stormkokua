export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { log } = await import("@/lib/logger");
    const { closeDb } = await import("@/lib/db");

    log.info("server starting", {
      node: process.version,
      env: process.env.NODE_ENV ?? "development",
      pid: process.pid,
    });

    let shuttingDown = false;

    function shutdown(signal: string, code = 0) {
      if (shuttingDown) return;
      shuttingDown = true;
      log.info("shutdown", { signal, code });
      try {
        closeDb();
      } catch (err) {
        log.error("error closing db", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
      process.exit(code);
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("uncaughtException", (err) => {
      log.error("uncaught exception", {
        error: err.message,
        stack: err.stack,
      });
      shutdown("uncaughtException", 1);
    });

    process.on("unhandledRejection", (reason) => {
      log.error("unhandled rejection", {
        error: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    });
  }
}
