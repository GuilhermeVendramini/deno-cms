import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/admin/content/article/add",
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    "/admin/content/article/edit/:id",
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    "/article/:id",
    entityController.view,
  )
  .post(
    "/admin/content/article/add",
    loggedMiddleware.needToBeLogged,
    entityController.addPost,
  )
  .get(
    "/admin/content/article/delete/:id",
    loggedMiddleware.needToBeLogged,
    entityController.delete,
  )
  .post(
    "/admin/content/article/delete",
    loggedMiddleware.needToBeLogged,
    entityController.deletePost,
  );

export default router;
