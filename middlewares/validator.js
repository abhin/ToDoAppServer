import {validationResult} from "express-validator";

export function getValidationResult(req, res, next) {
    try {
        const result = validationResult(req);
        if (result.isEmpty()) 
            next();
        else 
        res.status(400).json({
            success: false,
            message: result,
          }); 
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
}
