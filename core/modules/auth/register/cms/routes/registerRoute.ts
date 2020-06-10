import router from "../../../../../router.ts";
import registerController from "../controllers/registerController.ts";
import loggedMiddleware from "../../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get("/register", loggedMiddleware.alreadyLogged, registerController.register)
  .post("/register", registerController.registerPost);

export default router;
