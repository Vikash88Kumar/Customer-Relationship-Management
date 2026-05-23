import dotenv from "dotenv";
import connect from "./db/index.js";
import {app} from "./app.js";


dotenv.config({
    path:"./.env"
});

const startServer = async () => {
  await connect();
  console.log("MongoDB connected");

  const port=process.env.PORT || 3000
  app.listen(port, () => {
    console.log(` Server running on ${port}`);
  });
};

startServer();

