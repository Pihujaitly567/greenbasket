import { sendError } from "../utils/apiResponse.js";
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return sendError(res, 400, "Validation failed", errors);
  }
  req.body = result.data;
  next();
};
export default validate;
