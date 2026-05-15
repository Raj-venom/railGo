import logger from "../config/logger";
import prisma from "../config/prisma";
import adminProducer from "../kafka/producer/admin.producer";
import { createRouteDto, CreateTrainDTO } from "../types/train.types";
import {
  ApiError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/ApiError";

class TrainService {
  public createTrain = async (trainData: CreateTrainDTO) => {
    const { trainNumber, trainName, coachName, seats } = trainData;

    const existingTrain = await prisma.train.findUnique({
      where: { trainNumber },
    });

    if (existingTrain) {
      throw new ConflictError("Train with this number already exists");
    }

    const seatsData = seats.map((seat) => ({
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      price: seat.price,
    }));

    const train = await prisma.train.create({
      data: {
        trainNumber,
        trainName,
        coachName,
        totalSeats: seats.length,
        seats: {
          create: seatsData,
        },
      },
      include: {
        seats: {
          orderBy: { seatNumber: "asc" },
        },
      },
    });

    await adminProducer.publishTrainCreated(train).catch((error) => {
      logger.error("Failed to publish train created event", { error });
    });

    return train;
  };

  public getTrainById = async (id: string) => {
    const train = await prisma.train.findUnique({
      where: { id },
      include: {
        seats: {
          orderBy: { seatNumber: "asc" },
        },
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
      throw new NotFoundError("Train not found");
    }

    return train;
  };

  public getAllTrains = async () => {
    return await prisma.train.findMany({
      include: {
        seats: {
          orderBy: { seatNumber: "asc" },
        },
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
  };

  public createRoute = async (data: createRouteDto) => {
    const { trainId, stations } = data;

    const stationIds = stations.map((station: any) => station.stationId);

    if (stationIds.length !== new Set(stationIds).size) {
      throw new ApiError(400, "Duplicate station IDs are not allowed");
    }

    const existingStations = await prisma.station.findMany({
      where: { id: { in: stationIds } },
    });

    if (existingStations.length !== stationIds.length) {
      throw new BadRequestError("One or more stations do not exist");
    }

    const sortedStations = [...stations].sort(
      (a, b) => a.sequenceNumber - b.sequenceNumber,
    );

    for (let i = 0; i < sortedStations.length - 1; i++) {
      if (sortedStations[i].sequenceNumber !== i + 1) {
        throw new BadRequestError(
          "Sequence numbers must be continuous starting from 1",
        );
      }
    }

    const routeStations = stations.map((station: any) => ({
      stationId: station.stationId,
      sequenceNumber: station.sequenceNumber,
      arrivalTime: station.arrivalTime || null,
      departureTime: station.departureTime || null,
      distanceFromOrigin: station.distanceFromOrigin || 0,
    }));

    const route = await prisma.route.create({
      data: {
        trainId,
        routeStations: {
          create: routeStations,
        },
      },
      include: {
        routeStations: {
          include: { station: true },
          orderBy: { sequenceNumber: "asc" },
        },
      },
    });

    await adminProducer.publishRouteCreated(route).catch((error) => {
      logger.error("Failed to publish route created event", { error });
    });

    return route;
  };
}

export default TrainService;
