import router from "../../../../../router.ts";
import basicPageController from "../controllers/basicPageController.ts";
import loggedMiddleware from "../../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/admin/content/basic-page/add",
    loggedMiddleware.needToBeLogged,
    basicPageController.add,
  )
  .post(
    "/admin/content/basic-page/add",
    loggedMiddleware.needToBeLogged,
    basicPageController.addPost,
  );

export default router;
