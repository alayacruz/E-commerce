import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routers/authRouter.js";
import sellerRouter from "./routers/sellerRouter.js";
import reviewRouter from "./routers/reviewRouter.js";
import paymentRouter from "./routers/paymentRouter.js";
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

app.use(express.json());
app.use("/auth", authRouter);
app.use("/search", searchRouter);
app.use("/seller", sellerRouter);
app.use("/cart", cartRouter);
app.use("/review", reviewRouter);
app.use("/payment", paymentRouter);
app.use("/order", orderRouter);
app.use("/category", categoryRouter);
app.use("/products", productRouter);

app.listen(port, () => {
  console.log(`Server connected on port ${port}...`);
});
