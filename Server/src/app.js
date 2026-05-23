import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import adminRouter from "./routes/admin.routes.js"; // Import Admin router
import leadRouter from "./routes/lead.routes.js"; // Import Leads router

const app=express();


app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Mount Routes
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/leads", leadRouter);

app.get("/",(req,res)=>{
    res.send("backend is running")
})

export {app}