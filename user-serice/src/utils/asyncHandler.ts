import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

type AsyncRequestHandler<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<void>;

export const asyncHandler =
  <
    P = {},
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
  >(
    fn: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>,
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery> =>
  (req, res, next) => {
    Promise
      .resolve(fn(req, res, next))
      .catch(next);
  };