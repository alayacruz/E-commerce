import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.middleware.js";
import prisma from "./db.js";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const authRouter = express.Router();

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

    // --- Use Prisma's default uuid generation ---
    // const userId = `user_${Date.now()}_${Math.random()
    //   .toString(36)
    //   .substr(2, 9)}`;

    // Create user with related data using a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          // user_id: userId, // Let Prisma handle the ID
          email_id: email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName || null,
          // 'createdAt' will be set by the database default
        },
      });

      // Create phone number
      await tx.phoneNumber.create({
        data: {
          user_id: user.user_id, // Use the ID from the created user
          phone_no: phoneNum,
        },
      });

      // Create address
      await tx.address.create({
        data: {
          user_id: user.user_id, // Use the ID from the created user
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
            seller_id: user.user_id, // Use the ID from the created user
            gst_no: gstNo,
          },
        });
      } else {
        await tx.buyer.create({
          data: {
            buyer_id: user.user_id, // Use the ID from the created user
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
      phoneNumbers: true, 
      addresses: true,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "User doesn't exist" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const buyer = await prisma.buyer.findUnique({
    where: { buyer_id: user.user_id },
  });

  // set usertype - buyer or seller
  let userType = "unknown";
  if (buyer) {
    userType = "buyer";
  } else {
    const seller = await prisma.seller.findUnique({
      where: { seller_id: user.user_id },
    });
    if (seller) {
      userType = "seller";
    }
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
      userType: userType,
    },
    SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  // --- 2. UPDATE userInfo OBJECT ---
  const userInfo = {
    userId: user.user_id,
    username: username,
    email: user.email_id,
    firstName: user.first_name,
    phoneNumbers: user.phoneNumbers.map((p) => p.phone_no),
    addresses: user.addresses,
    createdAt: user.createdAt, 
    userType: userType, 
  };
  res.json({ message: "Login successful", token, userInfo });
});

// --- 3. ADD NEW ROUTE TO UPDATE PROFILE ---
authRouter.put("/profile", authMiddleware, async (req, res) => {
  const { userId } = req.user; // Get userId from the auth token
  const { username, email, phoneNumbers } = req.body;

  if (!username || !email || !phoneNumbers) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Parse the data from the frontend
    const [firstName, ...lastNameParts] = username.split(" ");
    const lastName = lastNameParts.join(" ") || null;
    const newPhone = phoneNumbers[0] || ""; // Get the primary phone

    // Use a transaction to update user and phone number
    await prisma.$transaction(async (tx) => {
      // 1. Update the User model
      await tx.user.update({
        where: { user_id: userId },
        data: {
          first_name: firstName,
          last_name: lastName,
          email_id: email,
        },
      });

      // 2. Delete all old phone numbers for this user
      await tx.phoneNumber.deleteMany({
        where: { user_id: userId },
      });

      // 3. Add the new phone number (if it's not empty)
      if (newPhone) {
        await tx.phoneNumber.create({
          data: {
            user_id: userId,
            phone_no: newPhone,
          },
        });
      }
    });

    // 4. Fetch the full, updated user info to send back
    const fullUser = await prisma.user.findUnique({
      where: { user_id: userId },
      include: { phoneNumbers: true, addresses: true },
    });

    const updatedUsername = fullUser.last_name
      ? `${fullUser.first_name} ${fullUser.last_name}`
      : fullUser.first_name;

    // Create the same userInfo object as the login route
    const userInfo = {
      userId: fullUser.user_id,
      username: updatedUsername,
      email: fullUser.email_id,
      firstName: fullUser.first_name,
      phoneNumbers: fullUser.phoneNumbers.map((p) => p.phone_no),
      addresses: fullUser.addresses,
      createdAt: fullUser.createdAt,
    };

    // 5. Send the new user object back to the frontend
    res.json(userInfo);
  } catch (e) {
    console.error("Profile update error:", e);
    if (e.code === "P2002") {
      return res.status(400).json({ error: "This email is already in use." });
    }
    res.status(500).json({ error: "Failed to update profile." });
  }
});

authRouter.post("/addAddresses", async (req, res) => {
  try {
    const { addresses, userId } = req.body; // addresses = array of objects

    if (!userId || !Array.isArray(addresses) || addresses.length === 0) {
      return res
        .status(400)
        .json({ error: "User ID not provided or addresses array is empty." });
    }

    // Attach userId to each address object
    const addressInserts = addresses.map((addr) => ({
      user_id: userId,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      pin: addr.pin,
    }));

    // Insert multiple addresses
    const newAddresses = await prisma.address.createMany({
      data: addressInserts,
      skipDuplicates: true,
    });

    return res
      .status(200)
      .json({ message: "New addresses were successfully added.", count: newAddresses.count });
  } catch (err) {
    console.error("Error adding addresses:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

authRouter.delete("/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) return res.status(400).json({ error: "User Id not given" });
    const deleteUser = await prisma.user.findFirst({
      where: { user_id: userId },
    });
    if (!deleteUser)
      return res
        .status(400)
        .json({ error: "User to be deleted does not exist" });
    await prisma.user.delete({ where: { user_id: userId } });
    return res.status(200).json({ message: "user was successfully deleted." });
  } catch (e) {
    console.log("Error deleting user: ", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default authRouter;