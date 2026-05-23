import { StatusCodes } from "http-status-codes";

import StationService from "../services/station.service";
import { BadRequestError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

class StationController {
  private stationService: StationService;
  constructor() {
    this.stationService = new StationService();
  }

  public createStation = asyncHandler(async (req, res) => {
    const { name, code, city, state } = req.body;

    if (!name || !code || !city || !state) {
      throw new BadRequestError("Name, code, city and state are required");
    }

    const station = await this.stationService.createStation({
      name,
      code,
      city,
      state,
    });

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          station,
          "Station created successfully",
        ),
      );
  });

  public getAllStations = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const station = await this.stationService.getAllStations({
      page,
      limit,
      search,
    });

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          station,
          "Stations fetched successfully",
        ),
      );
  });

  public getStationById = asyncHandler(async (req, res) => {
    const { stationId } = req.params as { stationId: string };

    const station = await this.stationService.getStationById(stationId);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          station,
          "Station fetched successfully",
        ),
      );
  });

  public updateStation = asyncHandler(async (req, res) => {
    const { stationId } = req.params as { stationId: string };

    const station = await this.stationService.updateStation(
      stationId,
      req.body,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          station,
          "Station updated successfully",
        ),
      );
  });

  public deleteStation = asyncHandler(async (req, res) => {
    const { stationId } = req.params as { stationId: string };
    await this.stationService.deleteStation(stationId);

    return res
      .status(StatusCodes.NO_CONTENT)
      .json(
        new ApiResponse(
          StatusCodes.NO_CONTENT,
          null,
          "Station deleted successfully",
        ),
      );
  });
}
