import express from "express";
import userRouter from "./routers/userRouter";
import authRouter from "./routers/authRouter";
import sellerRouter from "./routers/sellerRouter";
import cors from "cors";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

//fjf

app.use(express.json());
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/seller", sellerRouter);

app.listen(port, () => {
  console.log(`Server connected on port ${port}...`);
});
