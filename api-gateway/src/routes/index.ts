// TODO: ADD health check route with more details like uptime, version, etc.

// TODO: Add healthcheck with db connection status in all microservices and expose it in API Gateway

import express, { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware";
import { createServiceProxy, getCircuitBreakerStatus } from "../services/proxy";
import { config } from "../config";
import {
  ipRateLimit,
  endpointRateLimit,
  combinedRateLimit,
} from "../middleware/rateLimiting.middleware";

const router = Router();

const userServiceProxy = createServiceProxy(
  "userService",
  config.SERVICES.USER_SERVICE_URL,
);

// public routes
router.post(
  "/users/auth/send-otp",
  endpointRateLimit(5, 3600000), // 5 requests per hour
  userServiceProxy,
);

router.post(
  "/users/auth/verify-otp",
  endpointRateLimit(10, 3600000), // 10 requests per hour
  userServiceProxy,
);

router.post(
  "/users/auth/login",
  endpointRateLimit(100, 900000), // 100 requests per 15 minutes
  userServiceProxy,
);

router.post(
  "/users/auth/google-auth",
  endpointRateLimit(10, 900000), // 10 requests per 15 minutes
  userServiceProxy,
);

router.post(
  "/users/auth/refresh",
  endpointRateLimit(20, 900000), // 20 requests per 15 minutes
  userServiceProxy,
);

// private routes
router.get(
  "/users/user/profile",
  requireAuth,
  combinedRateLimit(),
  userServiceProxy,
);

// Health check route
router.get("/gateway/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Gateway is healthy",
    timestamp: new Date().toISOString(),
  });
});

router.get("/gateway/circuit-breaker-status", (req, res) => {
  const status = getCircuitBreakerStatus();
  res.status(200).json({
    success: true,
    circuitBreakers: status,
  });
});

export default router;
