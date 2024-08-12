import express, { Request, Response } from "express";
import {
  handleInsertMember,
  handleUpdateMember,
  handleDeleteMember,
  handleMembers,
} from "./controllers/memberController";
import { validateMemberDataMiddleware } from "./middleware/memberMiddleware";
const app = express();

const router = express.Router();
const port = 3000;
app.use(express.json());
app.use((req: Request, res: Response, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  next();
});
router
  .route("/api/members")
  .post(validateMemberDataMiddleware, handleInsertMember)
  .patch(validateMemberDataMiddleware, handleUpdateMember)
  .delete(handleDeleteMember)
  .get(handleMembers);

app.use(router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
