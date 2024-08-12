import express, { Request, Response } from "express";
import {
  handleInsertMember,
  handleUpdateMember,
  handleDeleteMember,
  handleMembers,
} from "./controllers/memberController";
import { handleLogin } from "./controllers/authController";
import { validateMemberDataMiddleware } from "./middleware/memberMiddleware";
import { verifyJWT } from "./middleware/verifyJWT";
const app = express();
import cookieParser from "cookie-parser";
import { handleNewUser } from "./controllers/registerController";
import { handleLogout } from "./controllers/logoutController";
import { handleRefreshToken } from "./controllers/refreshTokenController";

const router = express.Router();
const port = 3001;
app.use(express.json());
app.use(cookieParser());
app.use((req: Request, res: Response, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  next();
});

router.route("/").get(handleRefreshToken);
router.post("/api/register", handleNewUser);
router.post("/api/login", handleLogin);
router.post("/api/logout", handleLogout);

router.use(verifyJWT);

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
