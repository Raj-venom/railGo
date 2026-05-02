import { connectProducer, producer } from "../../config/kafka";
import logger from "../../config/logger";
import { KAFKA_TOPICS } from "../../../../shared/constants/kafka-topics";

class AdminProducer {
  private isInitialized: boolean;

  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await connectProducer();
      this.isInitialized = true;
      logger.info("AdminProducer initialized and connected to Kafka");
    } catch (error) {
      logger.error("Failed to initialize AdminProducer", { error });
      throw error;
    }
  }

  // Send message to Kafka topic
  async sendMessage(topic: string, key: string, value: any) {
    try {
      await this.initialize();
      const result = await producer.send({
        topic,
        messages: [
          {
            key: key || `${topic}-key-${Date.now()}`,
            value: JSON.stringify(value),
            timestamp: Date.now().toString(),
          },
        ],
      });

      logger.info(`Message sent to topic: ${topic}`, {
        key,
        partition: result[0].partition,
        offset: result[0].offset,
      });

      return result;
    } catch (error) {
      logger.error(`Failed to send message to topic: ${topic}`, {
        error: error instanceof Error ? error.message : String(error),
        key,
      });
      throw error;
    }
  }

  async publishStationCreated(station: any) {
    return this.sendMessage(
      KAFKA_TOPICS.STATION_CREATED,
      `station-${station.id}`,
      {
        eventType: "STATION_CREATED",
        data: station,
        timestamp: new Date().toISOString(),
      },
    );
  }

  async publishTrainCreated(trainData: any) {
    return this.sendMessage(
      KAFKA_TOPICS.TRAIN_CREATED,
      `train-${trainData.id}`,
      trainData,
    );
  }

  async publishRouteCreated(routeData: any) {
    return this.sendMessage(
      KAFKA_TOPICS.ROUTE_CREATED,
      `route-${routeData.id}`,
      routeData,
    );
  }

  async publishScheduleCreated(scheduleData: any) {
    return this.sendMessage(
      KAFKA_TOPICS.SCHEDULE_CREATED,
      `schedule-${scheduleData.id}`,
      scheduleData,
    );
  }

  async publishScheduleCancelled(schedule: any) {
    return this.sendMessage(
      KAFKA_TOPICS.SCHEDULE_CANCELLED,
      `schedule-cancelled-${schedule.id}`,
      {
        eventType: "SCHEDULE_CANCELLED",
        data: schedule,
        timestamp: new Date().toISOString(),
      },
    );
  }
}
