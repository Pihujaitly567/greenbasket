import { sendError } from "../utils/apiResponse.js";

// Takes a Zod schema and validates req.body against it.
// If validation fails, returns a 400 with field-level error details.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return sendError(res, 400, "Validation failed", errors);
  }

  // Replace body with parsed (cleaned) data
  req.body = result.data;
  next();
};

export default validate;
