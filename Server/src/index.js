import dotenv from "dotenv";
import connect from "./db/index.js";
import {app} from "./app.js";


dotenv.config({
    path:"./.env"
});

const startServer = async () => {
  try {
    await connect();
    console.log("MongoDB connected");

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(` Server running on ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server due to DB connection error:", error.message);
    process.exit(1);
  }
};

startServer();

