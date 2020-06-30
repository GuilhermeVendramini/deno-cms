import router from "../../../../router.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import mediaControllers from "../controllers/mediaController.ts";

router
  .post(
    "/temp_uploads/delete/:file",
    loggedMiddleware.needToBeLogged,
    mediaControllers.deleteTempFile,
  );

export default router;
