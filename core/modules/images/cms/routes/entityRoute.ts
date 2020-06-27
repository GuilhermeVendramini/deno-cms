import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";
import baseEntityMiddleware from "../../../../../shared/middlewares/baseEntityMiddleware.ts";
import { upload } from "upload";

router
  .get(
    `/admin/media/${entity.type.replace("_", "-")}`,
    loggedMiddleware.needToBeLogged,
    entityController.list,
  )
  .get(
    `/admin/media/${entity.type.replace("_", "-")}/add`,
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    `/admin/media/${entity.type.replace("_", "-")}/edit/:id`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeMediaAuthor,
    entityController.add,
  )
  .get(
    `/media/${entity.type.replace("_", "-")}/:id`,
    baseEntityMiddleware.mediaNeedToBePublished,
    entityController.view,
  )
  .post(
    `/admin/media/${entity.type.replace("_", "-")}/add`,
    loggedMiddleware.needToBeLogged,
    entityController.addPost,
  )
  .get(
    `/admin/media/${entity.type.replace("_", "-")}/delete/:id`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeMediaAuthor,
    entityController.delete,
  )
  .post(
    `/admin/media/${entity.type.replace("_", "-")}/delete`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeMediaAuthor,
    entityController.deletePost,
  )
  .post(
    "/media/images",
    loggedMiddleware.needToBeLogged,
    upload("files/media/images", ["jpg", "png"], 20000000, 10000000, true, false, true),
    async (context: Record<string, any>) => {
      context.response.body = context.uploadedFiles;
    },
  )
  .post(
    "/media/temporary/images",
    loggedMiddleware.needToBeLogged,
    upload("temp_uploads", ["jpg", "png"], 20000000, 10000000, false, false, true),
    async (context: Record<string, any>) => {
      context.response.body = context.uploadedFiles;
    },
  );

export default router;
