import axios from "axios";

import {
    ServiceUnavailableError,
    GatewayTimeoutError,
} from "../utils/ApiError";
import logger from "../config/logger";
import { config } from "../config";

const STATUS_CODES = {
    CLOSED: "CLOSED",
    OPEN: "OPEN",
    HALF_OPEN: "HALF_OPEN",
};

class CircuitBreaker {
    serviceName: string;
    failureCount: number;
    threshold: number;
    timeout: number;
    state: (typeof STATUS_CODES)[keyof typeof STATUS_CODES];
    nextAttempt: number;

    constructor(
        serviceName: string,
        threshold = config.CIRCUIT_BREAKER_THRESHOLD,
        timeout = config.CIRCUIT_BREAKER_TIMEOUT,
    ) {
        this.serviceName = serviceName;
        this.failureCount = 0;
        this.threshold = threshold;
        this.timeout = timeout;
        this.state = STATUS_CODES.CLOSED;
        this.nextAttempt = Date.now();
    }

    async execute(requestFunc: () => Promise<any>): Promise<any> {
        if (this.state === STATUS_CODES.OPEN) {
            if (Date.now() > this.nextAttempt) {
                throw new ServiceUnavailableError(
                    `Service ${this.serviceName} is temporarily unavailable. Circuit breaker is OPEN.`,
                );
            }
            this.state = STATUS_CODES.HALF_OPEN;
            logger.warn(`Circuit breaker for ${this.serviceName} is now HALF_OPEN.`);
        }

        try {
            const response = await requestFunc();
            this.onSuccess();
            return response;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        if (this.state === STATUS_CODES.HALF_OPEN) {
            this.state = STATUS_CODES.CLOSED;
            logger.info(`Circuit breaker for ${this.serviceName} is now CLOSED.`);
        }
    }

    onFailure() {
        this.failureCount++;

        if (this.failureCount >= this.threshold) {
            this.state = STATUS_CODES.OPEN;
            this.nextAttempt = Date.now() + this.timeout;
            logger.warn(
                `Circuit breaker for ${this.serviceName} is now OPEN. Next attempt at ${new Date(this.nextAttempt).toISOString()}`,
            );
        }
    }

    getState() {
        return {
            service: this.serviceName,
            state: this.state,
            failureCount: this.failureCount,
            nextAttempt:
                this.state === STATUS_CODES.OPEN
                    ? new Date(this.nextAttempt).toISOString()
                    : null,
        };
    }
}

// Create circuit breakers for each service
const circuitBreakers: Record<string, CircuitBreaker> = {
    userService: new CircuitBreaker("user-service"),
    searchService: new CircuitBreaker("search-service"),
    bookingService: new CircuitBreaker("booking-service"),
};

async function forwardRequest(
    serviceUrl: string,
    path: string,
    method: string,
    data: any,
    headers: any,
    circuitBreaker: CircuitBreaker,
) {
    const url = `${serviceUrl}${path}`;

    const requestConfig: {
        method: string;
        url: string;
        timeout: number;
        headers: any;
        validateStatus: (status: number) => boolean;
        maxRedirects: number;
        data?: any;
        params?: any;
    } = {
        method,
        url,
        timeout: config.SERVICE_TIMEOUT_MS, // Set timeout for downstream service requests
        headers: {
            ...headers,
            host: undefined, // Remove host header to avoid conflicts
            "content-length": undefined, // Let axios set content-length
        },

        // Accept all HTTP status codes as valid responses (prevent Axios from throwing on 4xx/5xx)
        // This allows the gateway to forward the exact response from downstream services
        validateStatus: () => true,
        maxRedirects: 5,
    };

    if (method !== 'GET' && method !== 'DELETE' && data) {
        requestConfig.data = data;
    }

    // For GET and DELETE, add params if data exists
    if ((method === 'GET' || method === 'DELETE') && data) {
        requestConfig.params = data;
    }

    logger.debug(`Forwarding ${method} ${url}`, {
        headers: requestConfig.headers,
        hasData: !!data,
        timeout: config.SERVICE_TIMEOUT_MS,
    });

    try {
        const response = await circuitBreaker.execute(() => axios(requestConfig));

        logger.debug(`Received response from ${serviceUrl}:`, {
            status: response.status,
            statusText: response.statusText,
        });

        return {
            status: response.status,
            data: response.data,
            headers: response.headers,
        };

    } catch (err: any) {
        logger.error(`Error forwarding to ${serviceUrl}:`, {
            message: err.message,
            code: err.code,
            url: url,
            method: method,
            timeout: config.SERVICE_TIMEOUT_MS,
        });

        if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
            throw new GatewayTimeoutError(`Request to ${serviceUrl} timed out after ${config.SERVICE_TIMEOUT_MS}ms`);
        }

        if (err.code === 'ECONNREFUSED') {
            throw new ServiceUnavailableError(`Cannot connect to ${serviceUrl}. Service may be down.`);
        }

        if (err.response) {
            logger.error(`Service error from ${serviceUrl}:`, {
                status: err.response.status,
                data: err.response.data,
            });

            return {
                status: err.response.status,
                data: err.response.data,
                headers: err.response.headers,
            };
        }

        logger.error(`Network error while calling ${serviceUrl}:`, err.message);
        throw new ServiceUnavailableError(`Service temporarily unavailable: ${err.message}`);
    }

}
