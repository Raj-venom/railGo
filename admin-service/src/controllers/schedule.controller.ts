import { StatusCodes } from "http-status-codes";
import { ApiError, BadRequestError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import ScheduleService from "../services/schedule.service";

class ScheduleController {
  private scheduleService: any;

  constructor() {
    this.scheduleService = new ScheduleService();
  }

  public createSchedule = asyncHandler(async (req, res) => {
    const { trainId, departureDate } = req.body;

    if (!trainId || !departureDate) {
      throw new BadRequestError("trainId and departureDate are required");
    }

    const schedule = await this.scheduleService.createSchedule(
      trainId,
      departureDate,
    );

    if (!schedule) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to create schedule",
        "SCHEDULE CREATION FAILED",
      );
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: schedule,
      message: "Schedule created successfully",
    });
  });
}
