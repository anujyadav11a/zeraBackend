import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';   


 const app = express();

 // Start email worker
 import "./controllers/Email/email.worker.js";
 const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(',').map(o => o.trim());

 const corsOptions = {
   origin: (origin, callback) => {
     // Allow requests with no origin (mobile apps, Postman) only in development
     if (!origin && process.env.NODE_ENV === 'development') {
       callback(null, true);
     } else if (origin && allowedOrigins.includes(origin)) {
       callback(null, true);
     } else {
       callback(new Error("Access denied by CORS policy"));
     }
   },
   credentials: true,// this set acces control allow  credentials to true
   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
   allowedHeaders: ["Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Request-Id",
    "Accept"],
   exposedHeaders: [],// filled according to frontend needs
   preflightContinue: false,
   optionsSuccessStatus: 204,
   maxAge: 86400 // 24 hours
 };

 app.use(cors(corsOptions));

 // Explicit preflight request handler
 app.options('*', cors(corsOptions));

 // Security headers middleware
 app.use((req, res, next) => {
   // Prevent MIME type sniffing
   res.setHeader('X-Content-Type-Options', 'nosniff');
   
   // Prevent clickjacking attacks
   res.setHeader('X-Frame-Options', 'SAMEORIGIN');
   
   // Enable XSS protection
   res.setHeader('X-XSS-Protection', '1; mode=block');
   
   // Enforce HTTPS (set to higher value in production)
   res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
   
   // CSP policy - enhanced security
   res.setHeader('Content-Security-Policy', 
     "default-src 'self'; " +
     "script-src 'self'; " +
     "style-src 'self' 'unsafe-inline'; " +
     "img-src 'self' data: https:; " +
     "font-src 'self'; " +
     "connect-src 'self'; " +
     "frame-ancestors 'none';"
   );
   
   // Control referrer information
   res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
   
   // Prevent DNS prefetching
   res.setHeader('X-DNS-Prefetch-Control', 'off');
   
   next();
 });

 app.use(express.json({limit:"10kb"}))
 app.use(express.urlencoded({limit:"10kb"}))
 app.use(express.static("public"))
 app.use(cookieParser())

 //User-Route
 import userRouter from "./routes/user.routes.js";
 app.use("/api/v1/User", userRouter)

 //Project-route
 import { Projectrouter } from './routes/project.route.js';
 app.use("/api/v1/project",Projectrouter)

 // Issue-Route
 import { issueRouter } from './routes/issue.route.js';
 app.use("/api/v1/issue",issueRouter)
 export default app

