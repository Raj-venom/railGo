import { producer, connectProducer } from "../../config/kafka";
import logger from "../../config/logger";
import { TOPICS } from "../../utils/constant";


class NotificationProducer {

    isInitialized: boolean;

    constructor() {
        this.isInitialized = false;
    }

    async initialize() {
        if (!this.isInitialized) {
            await connectProducer();
            this.isInitialized = true;
        }
    }



}