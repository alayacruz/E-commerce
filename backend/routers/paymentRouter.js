import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const paymentRouter = express.Router();

const createPaymentLink = () => {};

export default paymentRouter;