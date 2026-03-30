import axios from "axios";

import { ServiceUnavailableError, GatewayTimeoutError } from "../utils/ApiError";
import logger from "../config/logger";
import { config } from "../config";

const STATUS_CODES = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN',
};


class CircuitBreaker {
    serviceName: string;
    failureCount: number;
    threshold: number;
    timeout: number;
    state: typeof STATUS_CODES[keyof typeof STATUS_CODES];
    nextAttempt: number;

    constructor(serviceName: string, threshold = config.CIRCUIT_BREAKER_THRESHOLD, timeout = config.CIRCUIT_BREAKER_TIMEOUT) {
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
                    `Service ${this.serviceName} is temporarily unavailable. Circuit breaker is OPEN.`
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
            logger.warn(`Circuit breaker for ${this.serviceName} is now OPEN. Next attempt at ${new Date(this.nextAttempt).toISOString()}`);
        }
    }

    getState() {
        return {
            service: this.serviceName,
            state: this.state,
            failureCount: this.failureCount,
            nextAttempt: this.state === STATUS_CODES.OPEN ? new Date(this.nextAttempt).toISOString() : null,
        }
    }
}

// Create circuit breakers for each service
const circuitBreakers: Record<string, CircuitBreaker> = {
    userService: new CircuitBreaker('user-service'),
    searchService: new CircuitBreaker('search-service'),
    bookingService: new CircuitBreaker('booking-service')
};


async function forwardRequest(
    serviceUrl: string,
    path: string,
    method: string,
    data: any, headers: any,
    circuitBreaker: CircuitBreaker) {

}