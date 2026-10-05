import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import * as bookingDomain from "../../lib/booking.ts";

const require = createRequire(import.meta.url);
const compile = (path) => ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const compiledClient = compile("../../lib/google-booking.ts");
const routes = { bookings: compile("../../app/api/bookings/route.ts"), availability: compile("../../app/api/availability/route.ts") };

export function apiHarness(route, { env = {}, backendResult = { code: "OK" }, failure = false, upstreamStatus = 200 } = {}) {
  const calls = [];
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : ["2026-10-05T00:00:00Z"])); }
  }
  let client;
  const module = { exports: {} };
  const context = vm.createContext({
    module, exports: module.exports, Buffer, URL, AbortSignal, Date: FixedDate,
    require: (name) => name === "@/lib/booking" ? bookingDomain : name === "@/lib/google-booking" ? client : require(name),
    process: { env: {
      GOOGLE_BOOKING_SCRIPT_URL: "https://script.google.com/macros/s/test-deployment/exec",
      GOOGLE_BOOKING_SECRET: "test-backend-secret", ...env,
    } },
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (failure) throw new Error("upstream token must not appear in public errors");
      return Response.json(backendResult, { status: upstreamStatus });
    },
  });
  vm.runInContext(compiledClient, context);
  client = module.exports;
  context.module = { exports: {} };
  context.exports = context.module.exports;
  vm.runInContext(routes[route], context);
  return { calls, invoke: (request) => context.module.exports[request.method](request) };
}
