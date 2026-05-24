import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import adminRouter from "./routes/admin.routes.js"; // Import Admin router
import leadRouter from "./routes/lead.routes.js"; // Import Leads router
import productRouter from "./routes/product.routes.js"; // Import Products router
import authRouter from "./routes/auth.routes.js"; // Import Auth router
import quotationRouter from "./routes/quotation.routes.js"; // Import Quotations router


const app=express();


const allowedOrigins = [
  process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.replace(/\/$/, "") : null,
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5173"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
}));
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Mount Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/leads", leadRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/quotations", quotationRouter);

app.get("/",(req,res)=>{
    res.send("backend is running")
})

export {app}