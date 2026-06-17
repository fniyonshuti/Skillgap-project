import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { isAllowedOrigin } from "./config/cors.js";
import { env } from "./config/env.js";
import {
  apiRateLimit,
  authenticationRateLimit
} from "./config/rateLimits.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { requestContext } from "./middleware/requestContextMiddleware.js";
import { registerApiRoutes } from "./routes/index.js";

export const app = express();

if (env.nodeEnv === "production") {
  // Render and similar platforms terminate TLS at a trusted reverse proxy.
  // Express must trust that single hop for accurate rate-limit client IPs.
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(requestContext);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin, env.clientUrls));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
morgan.token("request-id", (req) => req.requestId);
app.use(
  morgan(
    env.nodeEnv === "production"
      ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" request_id=:request-id'
      : ":method :url :status :response-time ms request_id=:request-id"
  )
);
app.use(apiRateLimit);
app.use("/api/auth", authenticationRateLimit);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "skills-gap-analysis-api" });
});

registerApiRoutes(app);

app.use(notFound);
app.use(errorHandler);
