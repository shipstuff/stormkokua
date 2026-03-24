import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client";
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";

const register = new Registry();

collectDefaultMetrics({ register });

export const httpRequestsTotal = new Counter({
  name: "stormkokua_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: "stormkokua_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route"] as const,
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const httpInFlightRequests = new Gauge({
  name: "stormkokua_http_in_flight_requests",
  help: "Number of in-flight HTTP requests",
  registers: [register],
});

export function withMetrics(
  route: string,
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const start = Date.now();
    httpInFlightRequests.inc();
    try {
      const res = await handler(req);
      const duration = (Date.now() - start) / 1000;
      httpRequestDuration.observe({ method: req.method, route }, duration);
      httpRequestsTotal.inc({
        method: req.method,
        route,
        status_code: res.status,
      });
      log.info("request", {
        method: req.method,
        route,
        status: res.status,
        duration_ms: Math.round(duration * 1000),
      });
      return res;
    } catch (err) {
      const duration = (Date.now() - start) / 1000;
      httpRequestDuration.observe({ method: req.method, route }, duration);
      httpRequestsTotal.inc({ method: req.method, route, status_code: 500 });
      log.error("request failed", {
        method: req.method,
        route,
        duration_ms: Math.round(duration * 1000),
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    } finally {
      httpInFlightRequests.dec();
    }
  };
}

export { register };
