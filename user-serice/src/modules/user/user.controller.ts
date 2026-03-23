
import { StatusCodes } from "http-status-codes";
import { ApiError, UnauthorizedError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import UserService from "./user.service";


class UserController {

    private userService: UserService;

    constructor() {

        this.userService = new UserService();
    }

    public getUserProfile = asyncHandler(async (req, res) => {
        const userId = req.user.id;


        if (!userId) {
            throw new UnauthorizedError("User not authenticated", "LOGIN REQUIRED");
        }

        const user = await this.userService.getUserById(req.user.id);

        if (!user) {
            throw new ApiError(404, "User not found", "USER NOT FOUND");
        }

        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, user, "User profile retrieved successfully"));

    })


}

export default new UserController();