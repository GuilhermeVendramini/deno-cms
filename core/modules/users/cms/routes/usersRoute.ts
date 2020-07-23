import router from "../../../../router.ts";
import usersController from "../controllers/usersController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import cmsMiddleware from "../../../../../shared/middlewares/cmsMiddleware.ts";
import userRolesMiddleware from "../../middlewares/userRolesMiddleware.ts";
import { UserRoles } from "../../roles/UserRoles.ts"; 

router
  .get("/admin/users", loggedMiddleware.needToBeLogged, usersController.list)
  .get(
    "/admin/user/add",
    loggedMiddleware.needToBeLogged,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await userRolesMiddleware.needToHaveRoles(context, next, [UserRoles.admin]);
    },
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
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await userRolesMiddleware.needToHaveRoles(context, next, [UserRoles.admin, UserRoles.writer]);
    },
    cmsMiddleware.submittedByForm,
    usersController.addPost,
  )
  .get("/admin/user/:id", loggedMiddleware.needToBeLogged, usersController.view)
  .get(
    "/admin/user/delete/:id",
    loggedMiddleware.needToBeLogged,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await userRolesMiddleware.needToHaveRoles(context, next, [UserRoles.admin]);
    },
    usersController.delete,
  )
  .post(
    "/admin/user/delete",
    loggedMiddleware.needToBeLogged,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await userRolesMiddleware.needToHaveRoles(context, next, [UserRoles.admin]);
    },
    cmsMiddleware.submittedByForm,
    usersController.deletePost,
  );

export default router;
