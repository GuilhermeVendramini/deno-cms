import router from "../../../../router.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import mediaControllers from "../controllers/mediaController.ts";

router
  .get(
    "/media/assets/js/:file",
    loggedMiddleware.needToBeLogged,
    mediaControllers.getAssets,
  )
  .get(
    "/files/media/:type/:y/:m/:d/:hour/:min/:sec/:key/:file",
    mediaControllers.getFile,
  )
  .get(
    "/temp_uploads/:file",
    loggedMiddleware.needToBeLogged,
    mediaControllers.getTempFile,
  );

export default router;
