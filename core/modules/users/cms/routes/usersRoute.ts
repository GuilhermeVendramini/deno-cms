import router from "../../../../router.ts";
import usersController from "../controllers/usersController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get("/admin/users", loggedMiddleware.needToBeLogged, usersController.users);

export default router;
