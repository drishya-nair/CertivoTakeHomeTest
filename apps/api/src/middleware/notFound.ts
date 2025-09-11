import { Request, Response, NextFunction } from "express";
import HttpError from "../lib/httpError";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  // Delegate Not Found to the central error handler via a typed HttpError
  next(new HttpError(404));
}

export default notFound;


