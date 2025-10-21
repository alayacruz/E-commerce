import express from "express";
import authRouter from "./routers/authRouter.js";
import sellerRouter from "./routers/sellerRouter.js";
import cartRouter from "./routers/cartRouter.js";
import reviewRouter from "./routers/reviewRouter.js";
import paymentRouter from "./routers/paymentRouter.js";
import searchRouter from "./routers/searchRouter.js";
import orderRouter from "./routers/orderRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
import cors from "cors";
import dotenv from "dotenv";

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
app.use("/seller", sellerRouter);
app.use("/cart", cartRouter);
app.use("/review", reviewRouter);
app.use("/payment", paymentRouter);
app.use("/search", searchRouter);
app.use("/order", orderRouter);
app.use("/category", categoryRouter);

app.listen(port, () => {
  console.log(`Server connected on port ${port}...`);
});
