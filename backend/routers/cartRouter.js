import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express from "express";

//import { createClient } from "redis";

dotenv.config();

// const redisClient = await createClient({
//   username: "default",
//   password: "3o3fYKAqV2IMJ6bX2kY2aIcqzRCZibCa",
//   socket: {
//     host: "redis-12150.c93.us-east-1-3.ec2.redns.redis-cloud.com",
//     port: 12150,
//   },
// })
//   .on("error", (err) => console.log("Redis Client Error", err))
//   .connect();

// await redisClient.set("foo", "bar");
// const result = await redisClient.get("foo");
// console.log(result); // >>> bar

const prisma = new PrismaClient();
const cartRouter = express.Router();

cartRouter.get("/", async (req, res) => {
  try {
    const { buyerId } = req.query;

    if (!buyerId)
      return res.status(400).json({ error: "Buyer ID not provided" });

    // const cachedCart = await redisClient.hGetAll(`cart:${buyerId}`);
    // if (Object.keys(cachedCart).length > 0) {
    //   console.log("Cache hit");
    //   const cartItems = Object.values(cachedCart).map((item) =>
    //     JSON.parse(item)
    //   );
    //   return res.status(200).json({ cartItems });
    // }

    const cart = await prisma.cart.findUnique({
      where: { buyerId: buyerId.toString() },
    });
    if (!cart) return res.status(400).json({ error: "Cart not found" });

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.cartId },
      include: { product: true },
    });

    // const pipeline = redisClient.multi();
    // cartItems.forEach((cartItem) => {
    //   pipeline.hset(
    //     `cart:${buyerId}`,
    //     cartItem.productId.toString(),
    //     JSON.stringify(cartItem)
    //   );
    // });
    // pipeline.expire(`cart:${buyerId}`, 60 * 60 * 24);
    // await pipeline.exec();

    return res.status(200).json({ cartItems });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

cartRouter.post("/addItem", async (req, res) => {
  try {
    const { productId, quantity, buyerId } = req.body;
    if (!productId || !quantity || !buyerId)
      return res
        .status(400)
        .json({ error: "Product ID/Quantity/BuyerID not provided" });

    const product = await prisma.product.findUnique({ where: { productId } });
    if (!product)
      return res.status(400).json({ error: "Product does not exist" });
    if (product.availableQuantity < quantity)
      return res.status(400).json({ error: "Not enough stock" });

    let cart = await prisma.cart.findUnique({ where: { buyerId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { buyerId } });
    }

    let cartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.cartId, productId },
    });

    if (cartItem) {
      cartItem = await prisma.cartItem.update({
        where: { cartItemId: cartItem.cartItemId },
        data: { quantity: cartItem.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { cartId: cart.cartId, productId, quantity },
      });
    }

    await prisma.product.update({
      where: { productId },
      data: { availableQuantity: { decrement: quantity } },
    });
    //await redisClient.del(`cart:${buyerId}`);

    return res.status(200).json({ cartItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

cartRouter.patch("/updateQuantity", async (req, res) => {
  try {
    const { productId, quantity, buyerId, increase } = req.body;
    if (!productId || !quantity || !buyerId)
      return res
        .status(400)
        .json({ error: "Product ID/Quantity/BuyerID not provided" });

    let cart = await prisma.cart.findUnique({ where: { buyerId } });
    if (!cart) return res.status(400).json({ error: "Cart not found" });

    let cartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.cartId, productId },
    });
    if (!cartItem)
      return res.status(400).json({ error: "Cart item not found" });

    const product = await prisma.product.findUnique({ where: { productId } });
    if (!product)
      return res.status(400).json({ error: "Product does not exist" });

    if (increase && product.availableQuantity < quantity)
      return res.status(400).json({ error: "Not enough stock" });

    await prisma.product.update({
      where: { productId },
      data: {
        availableQuantity: increase
          ? { decrement: quantity }
          : { increment: quantity },
      },
    });

    let newQuantity = increase
      ? cartItem.quantity + quantity
      : cartItem.quantity - quantity;

    if (newQuantity <= 0) {
      await prisma.cartItem.delete({
        where: { cartItemId: cartItem.cartItemId },
      });
      //await redisClient.del(`cart:${buyerId}`);
      return res.status(200).json({ message: "Item removed from cart" });
    }

    cartItem = await prisma.cartItem.update({
      where: { cartItemId: cartItem.cartItemId },
      data: { quantity: newQuantity },
    });
    // await redisClient.del(`cart:${buyerId}`);
    return res.status(200).json({ cartItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default cartRouter;
