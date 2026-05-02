import logger from "../config/logger";
import prisma from "../config/prisma";
import adminProducer from "../kafka/producer/admin.producer";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/ApiError";

class ScheduleService {
  constructor() {
    // Initialize any necessary properties or dependencies here
  }

  // Create a new schedule

  // check if train exists
  // check if route exists for the train
  // check for seat length and route length

  // validate departure date and time
  // check if schedule already exists for the train on the same departure date

  // If all validations pass, create the schedule and publish the event to Kafka

  async createSchedule(scheduleData: any) {
    const { trainId, departureDate } = scheduleData;

    const train = await prisma.train.findUnique({
      where: { id: trainId },
      include: {
        seats: { orderBy: { seatNumber: "asc" } },
        route: {
          include: {
            routeStations: {
              include: { station: true },
              orderBy: { sequenceNumber: "asc" },
            },
          },
        },
      },
    });

    if (!train) {
      logger.warn(`Train with ID ${trainId} not found`);
      throw new NotFoundError(`Train with ID ${trainId} not found`);
    }

    if (!train.route) {
      logger.warn(`Route for train ID ${trainId} not found`);
      throw new NotFoundError(`Route for train ID ${trainId} not found`);
    }

    if (train.seats.length === 0) {
      logger.warn(`Train with ID ${trainId} has no seats defined`);
      throw new BadRequestError(
        `Train with ID ${trainId} has no seats defined`,
      );
    }

    if (train.route.routeStations.length === 0) {
      logger.warn(`Route for train ID ${trainId} has no stations defined`);
      throw new BadRequestError(
        `Route for train ID ${trainId} has no stations defined`,
      );
    }

    const parsedDate = new Date(departureDate);
    if (isNaN(parsedDate.getTime())) {
      logger.warn(`Invalid departure date: ${departureDate}`);
      throw new BadRequestError(`Invalid departure date: ${departureDate}`);
    }

    const existingSchedule = await prisma.schedule.findUnique({
      where: {
        trainId_departureDate: {
          trainId,
          departureDate: parsedDate,
        },
      },
    });

    if (existingSchedule) {
      logger.warn(
        `Schedule for train ID ${trainId} on date ${departureDate} already exists`,
      );
      throw new ConflictError(
        "Schedule for this train on the specified departure date already exists",
      );
    }
    const schedule = await prisma.schedule.create({
      data: {
        trainId,
        departureDate: parsedDate,
      },
    });

    const eventPayload = {
      scheduleId: schedule.id,
      trainId: train.id,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      coachName: train.coachName,
      totalSeats: train.totalSeats,
      departureDate: departureDate,
      status: schedule.status,
      seats: train.seats.map((s) => ({
        seatId: s.id,
        seatNumber: s.seatNumber,
        seatType: s.seatType,
        price: s.price,
      })),
      route: train.route.routeStations.map((rs) => ({
        stationId: rs.station.id,
        stationName: rs.station.name,
        stationCode: rs.station.code,
        city: rs.station.city,
        sequenceNumber: rs.sequenceNumber,
        arrivalTime: rs.arrivalTime,
        departureTime: rs.departureTime,
        distanceFromOrigin: rs.distanceFromOrigin,
      })),
    };

    await adminProducer.publishScheduleCreated(eventPayload);
    logger.info(
      `Schedule created and event published for train ${train.trainNumber} on ${departureDate}`,
    );

    return schedule;
  }
}


export default ScheduleService;
