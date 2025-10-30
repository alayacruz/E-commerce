import express from "express";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();
const orderRouter = express.Router();

/**
 * Helper to generate a unique ID for OrderItem, since the schema defines it as a String
 * and does not use @default(uuid()).
 * @param {string} orderId
 * @param {string} productId
 * @returns {string}
 */
const generateOrderItemId = (orderId, productId) => {
  return `${orderId}-${productId}-${Date.now()}`;
};

/**
 * POST /api/orders/buyNow
 * Places an order for a single product immediately.
 * Requires: buyerId, productId, quantity, amount, paymentMethod (optional, defaults to 'CoD')
 */
orderRouter.post("/buyNow", async (req, res) => {
  const { amount, buyerId, productId, quantity, paymentMethod } = req.body;

  // Basic validation
  if (!buyerId || !productId || !quantity || !amount) {
    return res
      .status(400)
      .json({
        error:
          "Missing required fields (buyerId, productId, quantity, amount).",
      });
  }

  const numericQuantity = parseInt(quantity);
  const numericAmount = parseFloat(amount);

  if (
    isNaN(numericQuantity) ||
    numericQuantity <= 0 ||
    isNaN(numericAmount) ||
    numericAmount <= 0
  ) {
    return res.status(400).json({ error: "Invalid quantity or amount." });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { productId: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (product.availableQuantity < numericQuantity) {
      return res
        .status(400)
        .json({
          error: `Insufficient stock for product ${product.name}. Available: ${product.availableQuantity}.`,
        });
    }

    // Security Check: Verify client-provided price against calculated price
    const expectedAmount = new Decimal(product.price)
      .mul(numericQuantity)
      .toFixed(2);
    if (parseFloat(expectedAmount) !== numericAmount) {
      return res
        .status(400)
        .json({
          error: `Amount discrepancy. Expected: ${expectedAmount}, Received: ${numericAmount}`,
        });
    }

    // Start Transaction for Atomicity
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Decrement inventory
      await tx.product.update({
        where: { productId: productId },
        data: { availableQuantity: { decrement: numericQuantity } },
      });

      // 2. Create the Order
      const newOrder = await tx.order.create({
        data: {
          order_date: new Date(),
          status: "PENDING",
          amount: new Decimal(numericAmount),
          buyer_id: buyerId,
        },
      });

      // 3. Create OrderItem
      await tx.orderItem.create({
        data: {
          order_id: newOrder.order_id,
          product_id: productId,
          quantity: numericQuantity,
          order_item_id: generateOrderItemId(newOrder.order_id, productId),
        },
      });

      // 4. Create Payment
      await tx.payment.create({
        data: {
          amount: new Decimal(numericAmount),
          status: "INITIATED",
          date: new Date(),
          method: paymentMethod || "CoD", // Default
          orderId: newOrder.order_id,
          buyerId: buyerId,
        },
      });

      return newOrder;
    });

    res
      .status(201)
      .json({
        message: "Buy Now order placed successfully.",
        order: transactionResult,
      });
  } catch (err) {
    // If the error originated from Prisma, the transaction will be rolled back.
    console.error("Buy Now order transaction failed:", err);
    res.status(500).json({ error: "Failed to place Buy Now order." });
  }
});

/**
 * POST /api/orders/placeCart
 * Places an order for all items in the buyer's cart.
 * Requires: amount, buyerId, paymentMethod (optional, defaults to 'CoD')
 */
orderRouter.post("/placeCart", async (req, res) => {
  const { amount, buyerId, paymentMethod } = req.body;

  // Initial checks (as provided in the prompt snippet, but completed)
  if (!buyerId || !amount) {
    return res.status(400).json({ error: "Buyer ID or Amount not provided" });
  }

  const buyer = await prisma.buyer.findUnique({ where: { buyer_id: buyerId } });
  if (!buyer) {
    return res
      .status(404)
      .json({ error: "Buyer with given buyerId does not exist" });
  }

  const cart = await prisma.cart.findUnique({ where: { buyerId: buyerId } });
  if (!cart) {
    return res
      .status(404)
      .json({ error: "Cart for given buyer does not exist" });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { cartId: cart.cartId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return res.status(400).json({ error: "Cart is empty." });
  }

  const numericAmount = parseFloat(amount);

  // Security Check: Verify client-provided total amount
  const calculatedTotal = cartItems
    .reduce(
      (sum, item) =>
        sum + new Decimal(item.product.price).mul(item.quantity).toNumber(),
      0
    )
    .toFixed(2);

  if (parseFloat(calculatedTotal) !== numericAmount) {
    return res
      .status(400)
      .json({
        error:
          "Amount discrepancy. Calculated total does not match provided amount.",
      });
  }

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Check inventory and decrement stock for all items
      for (const item of cartItems) {
        const product = item.product;
        if (product.availableQuantity < item.quantity) {
          // Throwing an error causes transaction rollback
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${product.availableQuantity}, Requested: ${item.quantity}`
          );
        }

        await tx.product.update({
          where: { productId: product.productId },
          data: { availableQuantity: { decrement: item.quantity } },
        });
      }

      // 2. Create the main Order
      const newOrder = await tx.order.create({
        data: {
          order_date: new Date(),
          status: "PENDING",
          amount: new Decimal(numericAmount),
          buyer_id: buyerId,
        },
      });

      // 3. Prepare and Create all OrderItems
      const orderItemData = cartItems.map((item) => ({
        order_id: newOrder.order_id,
        product_id: item.productId,
        quantity: item.quantity,
        order_item_id: generateOrderItemId(newOrder.order_id, item.productId),
      }));

      await tx.orderItem.createMany({
        data: orderItemData,
      });

      // 4. Create Payment record
      await tx.payment.create({
        data: {
          amount: new Decimal(numericAmount),
          status: "INITIATED",
          date: new Date(),
          method: paymentMethod || "CoD",
          orderId: newOrder.order_id,
          buyerId: buyerId,
        },
      });

      // 5. Clear the cart items for the buyer
      await tx.cartItem.deleteMany({
        where: { cartId: cart.cartId },
      });

      return newOrder;
    });

    res
      .status(201)
      .json({
        message: "Order placed successfully from cart.",
        order: transactionResult,
      });
  } catch (err) {
    const errorMessage = err.message.includes("Insufficient stock")
      ? err.message
      : "Failed to place order due to a database transaction error.";
    console.error("Cart order transaction failed:", err);
    res.status(500).json({ error: errorMessage });
  }
});

export default orderRouter;
