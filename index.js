import server from "./server.js";
import mongoose from "mongoose";

mongoose
  .connect(process.env.DB_URL)
  .then((data) => {
    server.listen(process.env.PORT || 8000, async () => {
      console.log(`DB connected & Server is running...Port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection error", err);
  });
