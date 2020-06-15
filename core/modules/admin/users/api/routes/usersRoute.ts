import router from "../../../../../router.ts";
import usersController from "../controllers/usersController.ts";
import loggedMiddleware from "../../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/api/users",
    loggedMiddleware.tokenValidated,
    usersController.users,
  ) .get(
    "/api/users/:id",
    loggedMiddleware.tokenValidated,
    usersController.users,
  );

export default router;
