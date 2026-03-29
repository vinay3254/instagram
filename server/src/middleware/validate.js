import { validationResult } from "express-validator";

export function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return res.status(422).json({
    message: "Validation failed.",
    errors: result.array().map((issue) => ({
      field: issue.path,
      message: issue.msg,
    })),
  });
}
