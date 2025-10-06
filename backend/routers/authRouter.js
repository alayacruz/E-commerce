import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//import { authMiddleware } from "../middleware/auth.js";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const authRouter = express.Router();
const prisma = new PrismaClient();

authRouter.post("/signup", async (req, res) => {
  const username = req.body["username"];
  const email = req.body["email"];
  const password = req.body["password"];
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: "User added" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create user" });
  }
});

authRouter.post("/login", async (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    return res.status(401).json({ message: "User doesn't exist" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
    },
    SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.json({ message: "Login successful", token });
});

export default authRouter;
