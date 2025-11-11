import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routers/authRouter.js";
import sellerRouter from "./routers/sellerRouter.js";
import reviewRouter from "./routers/reviewRouter.js";
import productRouter from "./routers/productRouter.js";
import searchRouter from "./routers/searchRouter.js";
import orderRouter from "./routers/orderRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
import cartRouter from "./routers/cartRouter.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// import { createClient } from "redis";

// const redisURL =
//   "rediss://default:XM9A1R1CtCaCh6NL3tVzUfUZCImWNjEA@redis-19222.c246.us-east-1-4.ec2.redns.redis-cloud.com:19222";
// const client = createClient({
//   url: redisURL,
//   // CRITICAL: This enables TLS/SSL encryption, which Redis Cloud requires
//   socket: {
//     tls: true,
//     // Set to true to bypass certificate verification, which might be necessary
//     // in some development environments, but for production,
//     // you should ensure proper certificates are used.
//     rejectUnauthorized: false,
//   },
// });
// client.on("error", (err) => console.log("Redis Client Error", err));

// await client.connect();

// await client.set("foo", "bar");
// const result = await client.get("foo");
// console.log(result); // >>> bar

app.use(express.json());
app.use("/auth", authRouter);
app.use("/search", searchRouter);
app.use("/seller", sellerRouter);
app.use("/cart", cartRouter);
app.use("/reviews", reviewRouter);
app.use("/orders", orderRouter);
app.use("/category", categoryRouter);
app.use("/products", productRouter);

app.listen(port, () => {
  console.log(`Server connected on port ${port}...`);
});
