import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";

const app: Express = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env["REPLIT_DEV_DOMAIN"] ? `https://${process.env["REPLIT_DEV_DOMAIN"]}` : null,
  "http://localhost:20516",
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed =
        allowedOrigins.some((o) => origin === o) ||
        /^https?:\/\/[^.]+\.replit\.app$/.test(origin) ||
        /^https?:\/\/[^.]+\.repl\.co$/.test(origin);
      if (allowed) return callback(null, true);
      callback(null, true);
    },
    credentials: true,
  }),
);

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI rate limit reached. Please wait before sending more requests." },
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

if (process.env.CLERK_SECRET_KEY) {
  app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
  app.use(
    clerkMiddleware((req) => ({
      publishableKey: publishableKeyFromHost(getClerkProxyHost(req) ?? "", process.env.CLERK_PUBLISHABLE_KEY),
    })),
  );
} else {
  logger.warn("Clerk is not configured; protected routes will return 401.");
}

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api/ai", aiLimiter);
app.use("/api", generalLimiter);
app.use("/api", router);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
