const express = require("express");
const userRouter = require("./routers/userRouter");
const authRouter = require("./routers/authRouter");
const sellerRouter = require("./routers/sellerRouter");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/seller", sellerRouter);

app.listen(port, () => {
  console.log(`Server connected on port ${port}...`);
});
