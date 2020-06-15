import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/admin/content/basic-page/add",
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    "/admin/content/basic-page/edit/:id",
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    "/basic-page/:id",
    entityController.view,
  )
  .post(
    "/admin/content/basic-page/add",
    loggedMiddleware.needToBeLogged,
    entityController.addPost,
  )
  .get(
    "/admin/content/basic-page/delete/:id",
    loggedMiddleware.needToBeLogged,
    entityController.delete,
  )
  .post(
    "/admin/content/basic-page/delete",
    loggedMiddleware.needToBeLogged,
    entityController.deletePost,
  );

export default router;
