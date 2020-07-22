import router from "../../../../router.ts";
import usersController from "../controllers/usersController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import cmsMiddleware from "../../../../../shared/middlewares/cmsMiddleware.ts";
import rolesMiddleware from "../../../../../shared/middlewares/rolesMiddleware.ts";

router
  .get("/admin/users", loggedMiddleware.needToBeLogged, usersController.list)
  .get(
    "/admin/user/add",
    loggedMiddleware.needToBeLogged,
    rolesMiddleware.needToBeAdmin,
    usersController.add,
  )
  .get(
    "/admin/user/edit/:id",
    loggedMiddleware.needToBeLogged,
    usersController.add,
  )
  .post(
    "/admin/user/add",
    loggedMiddleware.needToBeLogged,
    rolesMiddleware.needToBeAdmin,
    cmsMiddleware.submittedByForm,
    usersController.addPost,
  )
  .get("/admin/user/:id", loggedMiddleware.needToBeLogged, usersController.view)
  .get(
    "/admin/user/delete/:id",
    loggedMiddleware.needToBeLogged,
    rolesMiddleware.needToBeAdmin,
    usersController.delete,
  )
  .post(
    "/admin/user/delete",
    loggedMiddleware.needToBeLogged,
    rolesMiddleware.needToBeAdmin,
    cmsMiddleware.submittedByForm,
    usersController.deletePost,
  );

export default router;
