import express, { Request, Response } from "express";
import {
  handleBooks,
  handleDeleteBook,
  handleInsertBook,
  handleUpdateBook,
} from "./controllers/bookController";
import { validateBookDataMiddleware } from "./middleware/bookMiddleware";

const app = express();
const router = express.Router();
const port = 3000;

// Middleware to set headers and parse JSON body
app.use(express.json());
app.use((req: Request, res: Response, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  next();
});

router
  .route("/api/books")
  .post(validateBookDataMiddleware, handleInsertBook)
  .patch(validateBookDataMiddleware, handleUpdateBook)
  .delete(handleDeleteBook)
  .get(handleBooks); //same handler for full list and single book

// registering the router
app.use(router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
