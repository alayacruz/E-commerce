import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const authRouter = express.Router();
const prisma = new PrismaClient();

authRouter.post("/signup", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    isSeller,
    phoneNum,
    address,
    password,
    gstNo, // Required if isSeller is true
    gender, // Required if isSeller is false
    dob, // Required if isSeller is false
  } = req.body;

  try {
    // Validate required fields
    if (!email || !firstName || !password || !phoneNum || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (isSeller && !gstNo) {
      return res.status(400).json({ error: "GST number required for sellers" });
    }

    if (!isSeller && (!gender || !dob)) {
      return res
        .status(400)
        .json({ error: "Gender and DOB required for buyers" });
    }

    // Validate address object
    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.country ||
      !address.pin
    ) {
      return res.status(400).json({ error: "Complete address required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create user with related data using a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          user_id: userId,
          email_id: email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName || null,
        },
      });

      // Create phone number
      await tx.phoneNumber.create({
        data: {
          user_id: userId,
          phone_no: phoneNum,
        },
      });

      // Create address
      await tx.address.create({
        data: {
          user_id: userId,
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          pin: address.pin,
        },
      });

      // Create seller or buyer
      if (isSeller) {
        await tx.seller.create({
          data: {
            seller_id: userId,
            gst_no: gstNo,
          },
        });
      } else {
        await tx.buyer.create({
          data: {
            buyer_id: userId,
            gender: gender.toLowerCase(),
            dob: new Date(dob),
          },
        });
      }

      return user;
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: result.user_id,
      userType: isSeller ? "seller" : "buyer",
    });
  } catch (e) {
    console.error("Signup error:", e);

    if (e.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Email or phone number already exists" });
    }

    res.status(500).json({ error: "Failed to create user" });
  }
});

authRouter.post("/login", async (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];

  const user = await prisma.user.findUnique({
    where: { email_id: email },
    include: {
      phoneNumbers: true, // <-- This will fetch the related phone numbers
      addresses: true, // <-- This will fetch the related addresses
    },
  });

  if (!user) {
    return res.status(401).json({ message: "User doesn't exist" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  // handling null last name
  const username = user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.first_name;

  console.log(user);
  const token = jwt.sign(
    {
      userId: user.user_id,
      username: username,
      email: user.email_id,
      firstName: user.first_name,
    },
    SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );
  const userInfo = {
    userId: user.user_id,
    username: username,
    email: user.email_id,
    firstName: user.first_name,
    phoneNumbers: user.phoneNumbers.map((p) => p.phone_no),
    // Pass the full addresses array
    addresses: user.addresses,
  };
  res.json({ message: "Login successful", token, userInfo });
});

export default authRouter;
