import { Response } from "express";

export function sendServerError(
  res: Response,
  logLabel: string,
  error: unknown,
  message = "Something went wrong. Please try again."
) {
  console.error(logLabel, error);
  return res.status(500).json({
    success: false,
    message,
  });
}
