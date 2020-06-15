import router from "../../../../router.ts";
import basicPageController from "../controllers/basicPageController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/admin/content/basic-page/add",
    loggedMiddleware.needToBeLogged,
    basicPageController.add,
  )
  .get(
    "/admin/content/basic-page/edit/:id",
    loggedMiddleware.needToBeLogged,
    basicPageController.add,
  )
  .get(
    "/basic-page/:id",
    basicPageController.view,
  )
  .post(
    "/admin/content/basic-page/add",
    loggedMiddleware.needToBeLogged,
    basicPageController.addPost,
  )
  .get(
    "/admin/content/basic-page/delete/:id",
    loggedMiddleware.needToBeLogged,
    basicPageController.delete,
  )
  .post(
    "/admin/content/basic-page/delete",
    loggedMiddleware.needToBeLogged,
    basicPageController.deletePost,
  );

export default router;
