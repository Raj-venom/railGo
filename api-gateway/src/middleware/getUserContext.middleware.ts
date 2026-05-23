import { UnauthorizedError } from "../utils/ApiError";

function getUserContext(req, res, next) {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return next(
      new UnauthorizedError(
        "Unauthorized user: context missing, must come through api gateway",
      ),
    );
  }

  req.user = { id: userId };
  next();
}

export { getUserContext };
