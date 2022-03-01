import mongoose from "mongoose";
import { app } from "./app";
const connectDB = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT key must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI key must be defined");
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("db connected");
  } catch (error) {
    console.error(error);
  }
};

app.listen(6000, () => {
  console.log("Listening on port 6000!!!!!!");
});

connectDB();
