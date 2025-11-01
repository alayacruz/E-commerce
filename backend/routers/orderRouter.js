import express from "express";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { v4 as uuid4 } from "uuid";

const prisma = new PrismaClient();
const orderRouter = express.Router();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";

/**
 * Generates an OAuth 2.0 Access Token for PayPal API calls.
 * @returns {Promise<string>} The access token.
 */
const getAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(
    "base64"
  );
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get PayPal access token: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Creates a PayPal Order using the Orders API.
 * @param {Decimal} amount - The total amount for the order.
 * @param {string} currency_code - The currency code (e.g., "USD").
 * @param {string} intent - 'CAPTURE' or 'AUTHORIZE'.
 * @returns {Promise<{id: string, links: Array<object>}>} PayPal order ID and links.
 */
const createPayPalOrder = async (
  amount,
  returnUrl,
  cancelUrl,
  currency_code = "USD",
  intent = "CAPTURE"
) => {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "PayPal-Request-Id": Date.now().toString(), // Ensure idempotency
    },
    body: JSON.stringify({
      intent: intent,
      purchase_units: [
        {
          amount: {
            currency_code: currency_code,
            value: amount.toFixed(2),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            landing_page: "LOGIN",
            shipping_preference: "GET_FROM_FILE",
            user_action: "PAY_NOW",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorDetail = await response.json();
    throw new Error(
      `PayPal Order creation failed: ${JSON.stringify(errorDetail)}`
    );
  }

  return response.json();
};

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

orderRouter.post("/buyNow", async (req, res) => {
  const {
    amount,
    buyerId,
    productId,
    quantity,
    paymentMethod,
    returnUrl,
    cancelUrl,
  } = req.body;
  if (!amount || !buyerId || !productId || !quantity || !paymentMethod)
    return res.status(400).json({
      error: "Request body not complete",
    });

  if (!returnUrl || !cancelUrl)
    return res.status(400).json({
      error: "Request body does not have return/cancel Url",
    });

  const numericQuantity = parseInt(quantity);
  const numericAmount = parseFloat(amount);

  try {
    const product = await prisma.product.findUnique({
      where: { productId: productId },
    });
    if (!product) return res.status(404).json({ error: "Product not found." });
    if (product.availableQuantity < numericQuantity) {
      return res.status(500).json({
        error: "Enough stock not available of product",
      });
    }

    const expectedAmount = new Decimal(product.price)
      .mul(numericQuantity)
      .toFixed(2);
    if (parseFloat(expectedAmount) !== numericAmount) {
      return res.status(400).json({
        error: "Amount entered does not match Product Price*Quantity",
      });
    }

    let paymentExternalId = null;
    let approvalUrl = null;

    if (paymentMethod === "PayPal") {
      const paypalOrder = await createPayPalOrder(
        new Decimal(numericAmount),
        returnUrl,
        cancelUrl
      );
      console.log("PAYPAL ORDER: ", paypalOrder);
      paymentExternalId = paypalOrder.id; // Store PayPal's Order ID
      const approvalLink = paypalOrder.links.find(
        (link) => link.rel === "payer-action"
      );
      if (approvalLink) {
        approvalUrl = approvalLink.href;
      } else {
        throw new Error("Could not find PayPal approval URL.");
      }
    } else if (paymentMethod !== "CoD" && paymentMethod) {
      return res.status(400).json({ error: "Unsupported payment method." });
    }
    const orderId = uuid4();
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Decrement inventory (Commitment before payment is finalized, typical for high-demand)
      await tx.product.update({
        where: { productId: productId },
        data: { availableQuantity: { decrement: numericQuantity } },
      });

      // 2. Create the Order
      const newOrder = await tx.order.create({
        data: {
          order_id: orderId,
          order_date: new Date(),
          // Set to INITIATED for PayPal, PENDING for CoD
          status: paymentMethod === "PayPal" ? "PAYMENT_INITIATED" : "PENDING",
          amount: new Decimal(numericAmount),
          buyer_id: buyerId,
        },
      });

      // 3. Create OrderItem
      await tx.orderItem.create({
        data: {
          order_id: orderId,
          product_id: productId,
          quantity: quantity,
        },
      });

      // 4. Create Payment (Record payment intent and external ID)
      await tx.payment.create({
        data: {
          amount: new Decimal(numericAmount),
          // Status is PENDING for PayPal, INITIATED for CoD. It gets updated later for PayPal.
          status: paymentMethod === "PayPal" ? "PENDING" : "INITIATED",
          date: new Date(),
          method: paymentMethod || "CoD",
          orderId: newOrder.order_id,
          buyerId: buyerId,
          external_transaction_id: paymentExternalId,
        },
      });

      return newOrder;
    });

    // 5. Send PayPal link back to client (If applicable)
    if (paymentMethod === "PayPal" && approvalUrl) {
      return res.status(202).json({
        message: "PayPal Order created. Redirect buyer for approval.",
        order: transactionResult,
        approval_url: approvalUrl,
        paypal_order_id: paymentExternalId,
      });
    }

    res.status(201).json({
      message: "Buy Now order placed successfully (CoD).",
      order: transactionResult,
    });
  } catch (err) {
    console.error("Buy Now order transaction failed:", err);
    res.status(500).json({ error: "Failed to place Buy Now order." });
  }
});

// DOES NOT WORK
orderRouter.post("/placeCart", async (req, res) => {
  const {
    amount, //total amount
    buyerId,
    productArr, //array having objects like {productId:"", quantity:int}
    paymentMethod,
    returnUrl,
    cancelUrl,
  } = req.body;
  if (!buyerId || !productArr || !paymentMethod)
    return res.status(400).json({
      error: "Request body not complete",
    });
  if (!returnUrl || !cancelUrl)
    return res.status(400).json({
      error: "Request body does not have return/cancel Url",
    });
  try {
    let numericAmount = 0;
    const products = await Promise.all(
      productArr.map(async (e) => {
        const p = await prisma.product.findUnique({
          where: { productId: e.productId },
        });
        if (!p) throw new Error("Product with given ID does not exist.");
        if (p.quantity < e.quantity)
          throw new Error("Enough stock not available of product");
        numericAmount += p.price * e.quantity;
        return p;
      })
    );
    console.log("products are: ", products);

    let paymentExternalId = null;
    let approvalUrl = null;

    if (paymentMethod === "PayPal") {
      const paypalOrder = await createPayPalOrder(
        new Decimal(numericAmount),
        returnUrl,
        cancelUrl
      );
      console.log("PAYPAL ORDER: ", paypalOrder);
      paymentExternalId = paypalOrder.id; // Store PayPal's Order ID
      const approvalLink = paypalOrder.links.find(
        (link) => link.rel === "payer-action"
      );
      if (approvalLink) {
        approvalUrl = approvalLink.href;
      } else {
        throw new Error("Could not find PayPal approval URL.");
      }
    } else if (paymentMethod !== "CoD" && paymentMethod) {
      return res.status(400).json({ error: "Unsupported payment method." });
    }
    const orderId = uuid4();
    const transactionResult = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          order_id: orderId,
          order_date: new Date(),
          status: paymentMethod === "PayPal" ? "PAYMENT_INITIATED" : "PENDING",
          amount: new Decimal(numericAmount),
          buyer_id: buyerId,
        },
      });
      products.forEach(async (e) => {
        const orderItem = await tx.orderItem.create({
          data: {
            order_id: orderId,
            product_id: e.productId,
            quantity: productArr.find((x) => {
              return x.productId === e.productId;
            }).quantity,
          },
        });
      });

      await tx.payment.create({
        data: {
          amount: new Decimal(numericAmount),
          // Status is PENDING for PayPal, INITIATED for CoD. It gets updated later for PayPal.
          status: paymentMethod === "PayPal" ? "PENDING" : "INITIATED",
          date: new Date(),
          method: paymentMethod || "CoD",
          orderId: newOrder.order_id,
          buyerId: buyerId,
          external_transaction_id: paymentExternalId,
        },
      });
      return newOrder;
    });

    if (paymentMethod === "PayPal" && approvalUrl) {
      return res.status(202).json({
        message: "PayPal Order created. Redirect buyer for approval.",
        order: transactionResult,
        approval_url: approvalUrl,
        paypal_order_id: paymentExternalId,
      });
    }
    res.status(201).json({
      message: "Cart order placed successfully (CoD).",
      order: transactionResult,
    });
  } catch (err) {
    console.error("Cart order transaction failed:", err);
    res.status(500).json({ error: "Failed to place Buy Now order." });
  }
});

// called by the client *after* the buyer returns from PayPal's approval page.
orderRouter.post("/capture", async (req, res) => {
  const { paypalOrderId } = req.body;

  if (!paypalOrderId) {
    return res.status(400).json({ error: "Missing PayPal Order ID." });
  }

  try {
    const accessToken = await getAccessToken();

    // 1. Get the local Payment record to retrieve the Order ID
    const localPayment = await prisma.payment.findFirst({
      where: { external_transaction_id: paypalOrderId, status: "PENDING" },
    });

    if (!localPayment) {
      return res
        .status(404)
        .json({ error: "Local payment record not found or already captured." });
    }

    // 2. CAPTURE the funds via PayPal API
    const captureResponse = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const captureData = await captureResponse.json();

    if (captureResponse.ok && captureData.status === "COMPLETED") {
      // 3. Update local records in an atomic transaction
      await prisma.$transaction([
        // Update Order status
        prisma.order.update({
          where: { order_id: localPayment.orderId },
          data: { status: "PROCESSING" },
        }),
        // Update Payment status
        prisma.payment.update({
          where: { paymentId: localPayment.paymentId },
          data: {
            status: "COMPLETED",
            external_capture_id:
              captureData.purchase_units[0].payments.captures[0].id,
          },
        }),
      ]);

      return res.status(200).json({
        message: "Payment captured and order finalized.",
        paypal_status: captureData.status,
        order_id: localPayment.orderId,
      });
    } else {
      // 4. Handle failed/unsuccessful capture (e.g., set order status to FAILED)
      console.error("PayPal Capture failed or not completed:", captureData);
      await prisma.order.update({
        where: { order_id: localPayment.orderId },
        data: { status: "PAYMENT_FAILED" },
      });
      return res.status(500).json({
        error: "Payment capture failed with external service.",
        details: captureData,
      });
    }
  } catch (err) {
    console.error("Capture finalization failed:", err);
    res
      .status(500)
      .json({ error: "An unexpected error occurred during capture." });
  }
});

export default orderRouter;
