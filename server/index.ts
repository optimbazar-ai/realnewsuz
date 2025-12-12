import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import passport from "./auth";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { apiLimiter } from "./rate-limiter";
import { AppError } from "./errors";

const app = express();
app.set("trust proxy", 1);

// Security middleware with proper CSP for images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://images.unsplash.com",
        "https://*.unsplash.com",
        "https://platform.theverge.com",
        "https://cdn.arstechnica.net",
        "https://ichef.bbci.co.uk",
        "https://*.bbc.co.uk",
        "https://*.espn.com",
        "https://*.skysports.com",
        "https://*.theguardian.com",
        "https://*.reuters.com",
        "https://*.apnews.com",
        "https://*.gazeta.uz",
        "https://*",  // Allow all HTTPS images as fallback
      ],
      connectSrc: ["'self'", "https://*", "wss://*"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.CORS_ORIGIN || true
    : true,
  credentials: true,
}));

// Compression for better performance
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "real-news-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Handle AppError instances
    if (err instanceof AppError) {
      log(`❌ ${err.statusCode}: ${err.message}`);
      return res.status(err.statusCode).json({
        error: err.message,
        statusCode: err.statusCode
      });
    }

    // Handle other errors
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Ichki server xatosi";

    log(`❌ ${status}: ${message}`);
    res.status(status).json({ error: message, statusCode: status });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
  server.listen({
    port,
    host,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
