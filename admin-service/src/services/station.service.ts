import { Prisma } from "../../prisma/generated/client";
import logger from "../config/logger";
import prisma from "../config/prisma";
import adminProducer from "../kafka/producer/admin.producer";
import {
  ApiError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/ApiError";

export type CreateStationDTO = {
  name: string;
  code: string;
  city: string;
  state: string;
};

export type GetAllStationsOptions = {
  page: number;
  limit: number;
  search?: string;
};

class StationService {
  public createStation = async (stationData: CreateStationDTO) => {
    // Check if station name and code are unique
    const existingStation = await prisma.station.findFirst({
      where: {
        OR: [{ name: stationData.name }, { code: stationData.code }],
      },
    });

    if (existingStation) {
      throw new ConflictError("Station with this name or code already exists");
    }

    const station = await prisma.station.create({
      data: {
        name: stationData.name,
        code: stationData.code,
        city: stationData.city,
        state: stationData.state,
      },
    });

    logger.info("Station created successfully", {
      id: station.id,
      name: station.name,
      code: station.code,
    });

    await adminProducer.publishStationCreated(station).catch((error) => {
      logger.error("Failed to publish station created event", {
        error: error.message,
      });
    });

    return station;
  };

  public getAllStations = async (options: GetAllStationsOptions) => {
    const { page, limit, search } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.StationWhereInput = search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [stations, total] = await Promise.all([
      prisma.station.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: "asc",
        },
      }),
      prisma.station.count({ where }),
    ]);

    return { stations, total };
  };

  public getStationById = async (stationId: string) => {
    const station = await prisma.station.findUnique({
      where: { id: stationId },
    });
    if (!station) {
      throw new NotFoundError("Station not found");
    }
    return station;
  };

  public updateStation = async (
    stationId: string,
    updateData: Partial<CreateStationDTO>,
  ) => {
    const station = await prisma.station.findUnique({
      where: { id: stationId },
    });

    if (!station) {
      throw new NotFoundError("Station not found");
    }

    if (updateData.name || updateData.code) {
      const existingStation = await prisma.station.findFirst({
        where: {
          OR: [{ name: updateData.name }, { code: updateData.code }],
          NOT: { id: stationId },
        },
      });

      if (existingStation) {
        throw new ConflictError(
          "Another station with this name or code already exists",
        );
      }
    }

    const updatedStation = await prisma.station.update({
      where: { id: stationId },
      data: {
        name: updateData.name ?? station.name,
        code: updateData.code ?? station.code,
        city: updateData.city ?? station.city,
        state: updateData.state ?? station.state,
      },
    });

    logger.info("Station updated successfully", {
      id: updatedStation.id,
      name: updatedStation.name,
      code: updatedStation.code,
    });
    return updatedStation;
  };

  public deleteStation = async (stationId: string) => {
    const station = await prisma.station.findUnique({
      where: { id: stationId },
    });

    if (!station) {
      throw new NotFoundError("Station not found");
    }

    await prisma.station.delete({
      where: { id: stationId },
    });

    logger.info("Station deleted successfully", {
      id: station.id,
      name: station.name,
      code: station.code,
    });

    return station;
  };
}

export default StationService;
