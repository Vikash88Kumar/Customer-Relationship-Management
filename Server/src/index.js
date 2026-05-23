import "dotenv/config"; // <-- Automatically loads .env immediately on line 1!
import connect from "./db/index.js";
import { app } from "./app.js";

const startServer = async () => {
  try {
    await connect();
    console.log("MongoDB connected");

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Loaded CORS Origin: ${process.env.CORS_ORIGIN}`); // Verify it's working!
    });
  } catch (error) {
    console.error("Failed to start server due to DB connection error:", error.message);
    process.exit(1);
  }
};

startServer();