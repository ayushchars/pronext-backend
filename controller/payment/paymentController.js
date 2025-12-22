/**
 * NOWPayments Controller
 * Handles all payment-related endpoints
 */

import nowpaymentsService from "../../helpers/nowpaymentsService.js";
import paymentModel from "../../models/paymentModel.js";
import userModel from "../../models/authModel.js";
import {
  ErrorResponse,
  successResponse,
  notFoundResponse,
  successResponseWithData,
} from "../../helpers/apiResponse.js";
import logger from "../../helpers/logger.js";

const paymentLogger = logger.module("PAYMENT_CONTROLLER");

/**
 * Get available cryptocurrencies and payment methods
 * GET /api/payments/currencies
 */
export const getAvailableCurrencies = async (req, res) => {
  try {
    paymentLogger.start("Fetching available currencies");

    const currencies = await nowpaymentsService.getAvailableCurrencies();

    paymentLogger.success("Currencies retrieved", { count: currencies.length });
    return successResponseWithData(res, currencies, "Available currencies retrieved successfully");
  } catch (error) {
    paymentLogger.error("Error fetching currencies", error);
    return ErrorResponse(res, "Failed to fetch available currencies", 500);
  }
};

/**
 * Get price estimate
 * POST /api/payments/estimate
 * Body: { amount: 100, currency_from: "USD", currency_to: "BTC" }
 */
export const getPriceEstimate = async (req, res) => {
  try {
    const { amount, currency_from, currency_to } = req.body;

    paymentLogger.start("Getting price estimate", {
      amount,
      from: currency_from,
      to: currency_to,
    });

    if (!amount || !currency_from || !currency_to) {
      paymentLogger.warn("Missing required fields for price estimate");
      return ErrorResponse(res, "Amount, currency_from, and currency_to are required");
    }

    const estimate = await nowpaymentsService.getEstimatedPrice(
      amount,
      currency_from,
      currency_to
    );

    paymentLogger.success("Price estimate calculated", {
      estimatedAmount: estimate.estimated_amount,
    });

    return successResponseWithData(res, estimate, "Price estimate calculated successfully");
  } catch (error) {
    paymentLogger.error("Error calculating price estimate", error);
    return ErrorResponse(res, "Failed to calculate price estimate", 500);
  }
};

/**
 * Create payment invoice
 * POST /api/payments/invoice
 * Body: {
 *   price_amount: 100,
 *   price_currency: "USD",
 *   pay_currency: "BTC",
 *   order_id: "order_123",
 *   order_description: "Product purchase",
 *   customer_email: "user@example.com"
 * }
 */
export const createPaymentInvoice = async (req, res) => {
  try {
    const {
      price_amount,
      price_currency,
      pay_currency,
      order_id,
      order_description,
      customer_email,
    } = req.body;

    paymentLogger.start("Creating payment invoice", { orderId: order_id });

    // Validation
    if (!price_amount || !price_currency || !pay_currency || !order_id) {
      paymentLogger.warn("Missing required fields for invoice creation");
      return ErrorResponse(res, "Missing required payment fields");
    }

    // Get user from request
    const userId = req.user?._id;
    const userEmail = customer_email || req.user?.email;

    // Prepare callback URLs
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const ipn_callback_url = `${baseUrl}/api/payments/webhook`;
    const success_url = `${baseUrl}/payment-success`;
    const cancel_url = `${baseUrl}/payment-cancel`;

    const paymentData = {
      price_amount,
      price_currency,
      pay_currency,
      order_id,
      order_description,
      ipn_callback_url,
      success_url,
      cancel_url,
      customer_email: userEmail,
    };

    // Create invoice on NOWPayments
    const invoice = await nowpaymentsService.createPaymentInvoice(paymentData);

    // Save payment record to database
    const paymentRecord = await new paymentModel({
      userId,
      invoiceId: invoice.id,
      orderId: order_id,
      amount: price_amount,
      currency: price_currency,
      payCurrency: pay_currency,
      description: order_description,
      status: "pending",
      provider: "nowpayments",
      invoiceUrl: invoice.invoice_url,
      metadata: {
        createdAt: new Date(),
        invoiceData: invoice,
      },
    }).save();

    paymentLogger.success("Payment invoice created and saved to database", {
      invoiceId: invoice.id,
      orderId: order_id,
    });

    return successResponseWithData(
      res,
      {
        invoiceId: invoice.id,
        orderId: order_id,
        paymentUrl: invoice.invoice_url,
        amount: price_amount,
        currency: price_currency,
      },
      "Payment invoice created successfully"
    );
  } catch (error) {
    paymentLogger.error("Error creating payment invoice", error);
    return ErrorResponse(res, "Failed to create payment invoice", 500);
  }
};

/**
 * Create payment order
 * POST /api/payments/order
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const {
      price_amount,
      price_currency,
      pay_currency,
      order_id,
      order_description,
    } = req.body;

    paymentLogger.start("Creating payment order", { orderId: order_id });

    if (!price_amount || !price_currency || !pay_currency || !order_id) {
      return ErrorResponse(res, "Missing required payment fields");
    }

    const userId = req.user?._id;
    const ipn_callback_url = `${process.env.BASE_URL || "http://localhost:5000"}/api/payments/webhook`;

    const paymentData = {
      price_amount,
      price_currency,
      pay_currency,
      order_id,
      order_description,
      ipn_callback_url,
      customer_email: req.user?.email,
    };

    // Create payment on NOWPayments
    const payment = await nowpaymentsService.createPayment(paymentData);

    // Save payment record
    const paymentRecord = await new paymentModel({
      userId,
      paymentId: payment.payment_id,
      orderId: order_id,
      amount: price_amount,
      currency: price_currency,
      payCurrency: pay_currency,
      description: order_description,
      status: "pending",
      provider: "nowpayments",
      walletAddress: payment.pay_address,
      metadata: {
        createdAt: new Date(),
        paymentData: payment,
      },
    }).save();

    paymentLogger.success("Payment order created", {
      paymentId: payment.payment_id,
      walletAddress: payment.pay_address,
    });

    return successResponseWithData(
      res,
      {
        paymentId: payment.payment_id,
        orderId: order_id,
        walletAddress: payment.pay_address,
        amount: price_amount,
        currency: price_currency,
        payCurrency: pay_currency,
      },
      "Payment order created successfully"
    );
  } catch (error) {
    paymentLogger.error("Error creating payment order", error);
    return ErrorResponse(res, "Failed to create payment order", 500);
  }
};

/**
 * Get invoice status
 * GET /api/payments/invoice/:invoiceId
 */
export const getInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    paymentLogger.debug("Fetching invoice status", { invoiceId });

    if (!invoiceId) {
      return ErrorResponse(res, "Invoice ID is required");
    }

    const invoice = await nowpaymentsService.getInvoiceStatus(invoiceId);

    // Update database record if exists
    const paymentRecord = await paymentModel.findOne({ invoiceId });
    if (paymentRecord) {
      paymentRecord.status = invoice.status;
      paymentRecord.lastChecked = new Date();
      await paymentRecord.save();
    }

    paymentLogger.success("Invoice status retrieved", { invoiceId, status: invoice.status });

    return successResponseWithData(res, invoice, "Invoice status retrieved successfully");
  } catch (error) {
    paymentLogger.error("Error fetching invoice status", error);
    return ErrorResponse(res, "Failed to fetch invoice status", 500);
  }
};

/**
 * Get payment status
 * GET /api/payments/status/:paymentId
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    paymentLogger.debug("Fetching payment status", { paymentId });

    if (!paymentId) {
      return ErrorResponse(res, "Payment ID is required");
    }

    const payment = await nowpaymentsService.getPaymentStatus(paymentId);

    // Update database record
    const paymentRecord = await paymentModel.findOne({ paymentId });
    if (paymentRecord) {
      paymentRecord.status = payment.payment_status;
      paymentRecord.receivedAmount = payment.received_amount;
      paymentRecord.receivedCurrency = payment.received_currency;
      paymentRecord.lastChecked = new Date();
      await paymentRecord.save();

      // If payment confirmed, update user subscription
      if (payment.payment_status === "finished") {
        await userModel.findByIdAndUpdate(paymentRecord.userId, {
          subscriptionStatus: true,
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
        paymentLogger.success("User subscription activated", { userId: paymentRecord.userId });
      }
    }

    paymentLogger.success("Payment status retrieved", {
      paymentId,
      status: payment.payment_status,
    });

    return successResponseWithData(res, payment, "Payment status retrieved successfully");
  } catch (error) {
    paymentLogger.error("Error fetching payment status", error);
    return ErrorResponse(res, "Failed to fetch payment status", 500);
  }
};

/**
 * Get all user payments
 * GET /api/payments/my-payments
 */
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    paymentLogger.start("Fetching user payments", { userId, page, limit });

    const skip = (page - 1) * limit;

    const payments = await paymentModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    const total = await paymentModel.countDocuments({ userId });

    paymentLogger.success("User payments retrieved", {
      userId,
      count: payments.length,
      total,
    });

    return successResponseWithData(
      res,
      {
        payments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      "User payments retrieved successfully"
    );
  } catch (error) {
    paymentLogger.error("Error fetching user payments", error);
    return ErrorResponse(res, "Failed to fetch payments", 500);
  }
};

/**
 * Webhook for NOWPayments IPN callbacks
 * POST /api/payments/webhook
 */
export const handleIPNCallback = async (req, res) => {
  try {
    const { order_id, payment_id, payment_status, outcome_at } = req.body;
    const signature = req.headers["x-signature"];

    paymentLogger.start("Received IPN callback", {
      orderId: order_id,
      paymentId: payment_id,
      status: payment_status,
    });

    // Verify signature
    if (!nowpaymentsService.verifyIPNSignature(req.body, signature)) {
      paymentLogger.warn("Invalid IPN signature received");
      return ErrorResponse(res, "Invalid signature", 401);
    }

    // Update payment record
    const paymentRecord = await paymentModel.findOne({
      $or: [{ orderId: order_id }, { paymentId: payment_id }],
    });

    if (!paymentRecord) {
      paymentLogger.warn("Payment record not found for webhook", { orderId: order_id });
      return notFoundResponse(res, "Payment not found");
    }

    // Update status
    paymentRecord.status = payment_status;
    paymentRecord.lastUpdated = new Date(outcome_at || Date.now());
    await paymentRecord.save();

    // If payment is finished, activate subscription based on amount
    if (payment_status === "finished") {
      // Determine subscription tier based on amount
      let subscriptionTier = "Basic";
      if (price_amount >= 30) {
        subscriptionTier = "Pro";
      } else if (price_amount >= 15) {
        subscriptionTier = "Premium";
      } else {
        subscriptionTier = "Basic";
      }

      await userModel.findByIdAndUpdate(paymentRecord.userId, {
        subscriptionStatus: true,
        subscriptionTier: subscriptionTier,
        subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastPaymentDate: new Date(),
      });

      paymentLogger.success("Subscription activated via webhook", {
        userId: paymentRecord.userId,
        orderId: order_id,
        tier: subscriptionTier,
        currency: pay_currency,
      });
    }

    if (payment_status === "failed" || payment_status === "expired") {
      paymentLogger.warn("Payment failed or expired", {
        orderId: order_id,
        status: payment_status,
      });
    }

    return successResponse(res, "Webhook processed successfully");
  } catch (error) {
    paymentLogger.error("Error processing webhook", error);
    return ErrorResponse(res, "Webhook processing failed", 500);
  }
};

/**
 * Get minimum payment amount
 * GET /api/payments/minimum-amount?from=USD&to=BTC
 */
export const getMinimumAmount = async (req, res) => {
  try {
    const { from = "USD", to = "BTC" } = req.query;

    paymentLogger.debug("Fetching minimum amount", { from, to });

    const minimumAmount = await nowpaymentsService.getMinimumAmount(from, to);

    return successResponseWithData(
      res,
      minimumAmount,
      "Minimum amount retrieved successfully"
    );
  } catch (error) {
    paymentLogger.error("Error fetching minimum amount", error);
    return ErrorResponse(res, "Failed to fetch minimum amount", 500);
  }
};

/**
 * Get exchange rate
 * GET /api/payments/exchange-rate?from=USD&to=BTC
 */
export const getExchangeRate = async (req, res) => {
  try {
    const { from = "USD", to = "BTC" } = req.query;

    paymentLogger.debug("Fetching exchange rate", { from, to });

    const exchangeRate = await nowpaymentsService.getExchangeRate(from, to);

    return successResponseWithData(res, exchangeRate, "Exchange rate retrieved successfully");
  } catch (error) {
    paymentLogger.error("Error fetching exchange rate", error);
    return ErrorResponse(res, "Failed to fetch exchange rate", 500);
  }
};

/**
 * Get payment by order ID
 * GET /api/payments/order/:orderId
 */
export const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    paymentLogger.debug("Fetching payment by order ID", { orderId });

    if (!orderId) {
      return ErrorResponse(res, "Order ID is required");
    }

    // First try to get from database
    let paymentRecord = await paymentModel.findOne({ orderId });

    if (paymentRecord) {
      return successResponseWithData(res, paymentRecord, "Payment found successfully");
    }

    // If not in database, fetch from NOWPayments API
    const payment = await nowpaymentsService.getPaymentByOrderId(orderId);

    paymentLogger.success("Payment retrieved by order ID", { orderId });

    return successResponseWithData(res, payment, "Payment retrieved successfully");
  } catch (error) {
    paymentLogger.error("Error fetching payment by order ID", error);
    return ErrorResponse(res, "Failed to fetch payment", 500);
  }
};

/**
 * Get admin dashboard - payment statistics
 * GET /api/payments/admin/statistics
 */
export const getPaymentStatistics = async (req, res) => {
  try {
    paymentLogger.start("Fetching payment statistics");

    const [
      totalPayments,
      totalAmount,
      completedPayments,
      pendingPayments,
      failedPayments,
      paymentsByProvider,
    ] = await Promise.all([
      paymentModel.countDocuments(),
      paymentModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
      paymentModel.countDocuments({ status: "finished" }),
      paymentModel.countDocuments({ status: "pending" }),
      paymentModel.countDocuments({ status: "failed" }),
      paymentModel.aggregate([
        {
          $group: {
            _id: "$provider",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statistics = {
      totalPayments,
      totalAmount: totalAmount[0]?.total || 0,
      completedPayments,
      pendingPayments,
      failedPayments,
      paymentsByProvider: paymentsByProvider.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    paymentLogger.success("Payment statistics retrieved", statistics);

    return successResponseWithData(
      res,
      statistics,
      "Payment statistics retrieved successfully"
    );
  } catch (error) {
    paymentLogger.error("Error fetching payment statistics", error);
    return ErrorResponse(res, "Failed to fetch statistics", 500);
  }
};

/**
 * Create subscription payment
 * POST /api/payments/subscribe
 * Body: {
 *   subscriptionTier: "Premium",  // Basic, Premium, Pro
 *   pay_currency: "USDT"  // USDT, BTC, ETH, etc.
 * }
 */
export const createSubscriptionPayment = async (req, res) => {
  try {
    const { subscriptionTier = "Premium", pay_currency = "USDT" } = req.body;
    
    paymentLogger.start("Creating subscription payment", {
      tier: subscriptionTier,
      payCurrency: pay_currency,
    });

    // Validate subscription tier
    const validTiers = {
      Basic: { amount: 5, description: "Basic Subscription - 30 Days" },
      Premium: { amount: 15, description: "Premium Subscription - 30 Days" },
      Pro: { amount: 30, description: "Pro Subscription - 30 Days" },
    };

    if (!validTiers[subscriptionTier]) {
      paymentLogger.warn("Invalid subscription tier", { tier: subscriptionTier });
      return ErrorResponse(res, "Invalid subscription tier. Must be Basic, Premium, or Pro");
    }

    const userId = req.user?._id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      paymentLogger.warn("User not authenticated for subscription payment");
      return ErrorResponse(res, "User must be authenticated to purchase subscription", 401);
    }

    const tierData = validTiers[subscriptionTier];
    const order_id = `subscription_${userId}_${subscriptionTier}_${Date.now()}`;

    const paymentData = {
      price_amount: tierData.amount,
      price_currency: "USD",
      pay_currency: pay_currency,
      order_id: order_id,
      order_description: tierData.description,
      ipn_callback_url: `${process.env.BASE_URL || "http://localhost:5000"}/api/payments/webhook`,
      customer_email: userEmail,
    };

    // Create invoice on NOWPayments
    const invoice = await nowpaymentsService.createPaymentInvoice(paymentData);

    // Save subscription payment record
    const paymentRecord = await new paymentModel({
      userId,
      invoiceId: invoice.id,
      orderId: order_id,
      amount: tierData.amount,
      currency: "USD",
      payCurrency: pay_currency,
      description: tierData.description,
      status: "pending",
      provider: "nowpayments",
      invoiceUrl: invoice.invoice_url,
      subscriptionType: subscriptionTier,
      metadata: {
        createdAt: new Date(),
        invoiceData: invoice,
        subscriptionTier: subscriptionTier,
      },
    }).save();

    paymentLogger.success("Subscription payment invoice created", {
      userId,
      tier: subscriptionTier,
      invoiceId: invoice.id,
    });

    return successResponseWithData(
      res,
      {
        invoiceId: invoice.id,
        orderId: order_id,
        paymentUrl: invoice.invoice_url,
        subscriptionTier: subscriptionTier,
        amount: tierData.amount,
        currency: "USD",
        payCurrency: pay_currency,
        walletAddress: invoice.pay_address || null,
        message: "Please complete payment to activate subscription",
      },
      "Subscription payment invoice created successfully"
    );
  } catch (error) {
    paymentLogger.error("Error creating subscription payment", error);
    return ErrorResponse(res, "Failed to create subscription payment", 500);
  }
};
