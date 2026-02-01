import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Request Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1", router);

// Global Error Handler
app.use((err, req, res, next) => {
    if (err.name === 'MulterError') {
        return res.status(400).json({ status: "failed", message: "File Upload Error: " + err.message });
    }
    console.error("Unhandled Error:", err);
    res.status(500).json({ status: "failed", message: "Server Error: " + err.message });
});

export { app };