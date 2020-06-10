import router from "../../../../router.ts";
import contentController from "../controllers/contentController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/admin/content",
    loggedMiddleware.needToBeLogged,
    contentController.content,
  );

export default router;
