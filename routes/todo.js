import express from "express";
import { isLoggedIn } from "../middlewares/auth.js";
import {
  create,
  getAllTodos,
  update,
  deleteTodo,
} from "../controllers/todo.js";
import { body } from "express-validator";
import { getValidationResult } from "../middlewares/validator.js";

const router = express.Router();

router.post(
  "/create",
  isLoggedIn,
  body("title").exists().trim().isLength({ min: 3 }).withMessage("Title should be Minimum 3 characters"),
  getValidationResult,
  create
);
router.get("/read", isLoggedIn, getAllTodos);
router.put("/update", isLoggedIn, update);
router.delete("/delete/:id", isLoggedIn, deleteTodo);

export default router;
