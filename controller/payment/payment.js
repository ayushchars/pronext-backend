/**
 * Payment Routes - NOWPayments Integration
 * Base path: /api/payments
 */

import express from "express";
import {
  getAvailableCurrencies,
  getPriceEstimate,
  createPaymentInvoice,
  createPaymentOrder,
  createSubscriptionPayment,
  getInvoiceStatus,
  getPaymentStatus,
  getUserPayments,
  handleIPNCallback,
  getMinimumAmount,
  getExchangeRate,
  getPaymentByOrderId,
  getPaymentStatistics,
} from "./paymentController.js";
import { authMiddleware, isAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Public Routes (No Authentication Required)
 */

// Get available cryptocurrencies
router.get("/currencies", getAvailableCurrencies);

// Get price estimate
router.post("/estimate", getPriceEstimate);

// Get minimum payment amount
router.get("/minimum-amount", getMinimumAmount);

// Get exchange rate
router.get("/exchange-rate", getExchangeRate);

// NOWPayments IPN Webhook (unauthenticated, but signature verified)
router.post("/webhook", handleIPNCallback);

/**
 * Protected Routes (Authentication Required)
 */

// Get payment status by invoice ID
router.get("/invoice/:invoiceId", authMiddleware, getInvoiceStatus);

// Get payment status by payment ID
router.get("/status/:paymentId", authMiddleware, getPaymentStatus);

// Get payment by order ID
router.get("/order/:orderId", authMiddleware, getPaymentByOrderId);

// Create payment invoice (for UI/Invoice flow)
router.post("/invoice", authMiddleware, createPaymentInvoice);

// Create payment order (for direct payment flow)
router.post("/order", authMiddleware, createPaymentOrder);

// Create subscription payment (easy subscription flow)
router.post("/subscribe", authMiddleware, createSubscriptionPayment);

// Get user's payment history
router.get("/my-payments", authMiddleware, getUserPayments);

/**
 * Admin Routes
 */

// Get payment statistics
router.get("/admin/statistics", authMiddleware, isAdmin, getPaymentStatistics);

export default router;
