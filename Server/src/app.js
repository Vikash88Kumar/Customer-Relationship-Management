import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import adminRouter from "./routes/admin.routes.js"; // Import Admin router
import leadRouter from "./routes/lead.routes.js"; // Import Leads router
import productRouter from "./routes/product.routes.js"; // Import Products router
import authRouter from "./routes/auth.routes.js"; // Import Auth router
import quotationRouter from "./routes/quotation.routes.js"; // Import Quotations router


const app=express();


const allowedOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.replace(/\/$/, "") : "*";

app.use(cors({
  origin: allowedOrigin,
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