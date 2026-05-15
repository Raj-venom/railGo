import { StatusCodes } from "http-status-codes";
import TrainService from "../services/train.service";
import { BadRequestError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { CreateTrainDTO } from "../types/train.types";

class TrainController {
  private trainService: TrainService;
  constructor() {
    this.trainService = new TrainService();
  }

  public createTrain = asyncHandler(async (req, res) => {
    const { trainNumber, trainName, coachName, seats } =
      req.body as CreateTrainDTO;

    // TODO: validate the request body using a validation library like Joi or Yup

    if (!trainNumber || !trainName || !coachName || !seats) {
      throw new BadRequestError("All fields are required");
    }

    if (seats.length === 0) {
      throw new BadRequestError("Seats are required");
    }

    // Check for duplicate seats
    const uniqueSeats = new Set(seats);

    if (uniqueSeats.size !== seats.length) {
      throw new BadRequestError("Duplicate seats are not allowed");
    }

    const train = await this.trainService.createTrain({
      trainNumber,
      trainName,
      coachName,
      seats,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Train created successfully",
      data: train,
    });
  });

  public getTrainById = asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    if (!id) {
      throw new BadRequestError("Train ID is required");
    }

    const train = await this.trainService.getTrainById(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Train retrieved successfully",
      data: train,
    });
  });

  public getAllTrains = asyncHandler(async (req, res) => {
    const trains = await this.trainService.getAllTrains();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Trains retrieved successfully",
      data: trains,
    });
  });

  public createRoute = asyncHandler(async (req, res) => {
    const { trainId, stations } = req.body;

    if (!trainId || !stations) {
      throw new BadRequestError("Train ID and stations are required");
    }

    if (stations.length < 2) {
      throw new BadRequestError("A route must have at least 2 stations");
    }

    const route = await this.trainService.createRoute({ trainId, stations });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Route created successfully",
      data: route,
    });
  });
}

export default TrainController;
