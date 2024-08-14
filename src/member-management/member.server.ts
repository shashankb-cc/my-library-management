import express, { Request, Response } from "express";
import {
  handleInsertMember,
  handleUpdateMember,
  handleDeleteMember,
  handleMembers,
} from "./controllers/memberController";
import { handleLogin, handleLibrarianLogin } from "./controllers/authController";
import { validateMemberDataMiddleware } from "./middleware/memberMiddleware";
import { verifyJWT } from "./middleware/verifyJWT";
import { verifyRole } from "./middleware/verifyRole";

const app = express();
import cookieParser from "cookie-parser";
import { handleNewUser } from "./controllers/registerController";
import { handleLogout } from "./controllers/logoutController";
import { handleRefreshToken } from "./controllers/refreshTokenController";

const router = express.Router();
const port = 3000;
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
router.post("/api/librarian-login", handleLibrarianLogin);  // Librarian login route
router.post("/api/logout", handleLogout);
router.route("/api/refresh-token").get(handleRefreshToken);

router.use(verifyJWT);

// Only librarians can access these routes
router
  .route("/api/members")
  .post(verifyRole(["librarian"]), validateMemberDataMiddleware, handleInsertMember)
  .patch(verifyRole(["librarian"]), validateMemberDataMiddleware, handleUpdateMember)
  .delete(verifyRole(["librarian"]), handleDeleteMember)
  .get(verifyRole(["librarian", "member"]), handleMembers);

app.use(router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
