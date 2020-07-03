import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";
import baseEntityMiddleware from "../../../../../shared/middlewares/baseEntityMiddleware.ts";
import cmsMiddleware from "../../../../../shared/middlewares/cmsMiddleware.ts";
import { upload } from "upload";

router
  .get(
    `/admin/media/${entity.type}`,
    loggedMiddleware.needToBeLogged,
    entityController.list,
  )
  .get(
    `/admin/media/${entity.type}/add`,
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    `/admin/media/${entity.type}/edit/:id`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeMediaAuthor,
    entityController.add,
  )
  .get(
    `/media/${entity.type}/:id`,
    baseEntityMiddleware.mediaNeedToBePublished,
    entityController.view,
  )
  .post(
    `/admin/media/${entity.type}/add`,
    loggedMiddleware.needToBeLogged,
    cmsMiddleware.submittedByForm,
    entityController.addPost,
  )
  .get(
    `/admin/media/${entity.type}/delete/:id`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeMediaAuthor,
    entityController.delete,
  )
  .post(
    `/admin/media/${entity.type}/delete`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeMediaAuthor,
    cmsMiddleware.submittedByForm,
    entityController.deletePost,
  )
  .post(
    `/media/${entity.type}`,
    loggedMiddleware.needToBeLogged,
    upload(
      "files/media/videos",
      ["mp4", "webm"],
      2 * 80000000,
      2 * 40000000,
      true,
      false,
      true,
    ),
    async (context: Record<string, any>) => {
      context.response.body = context.uploadedFiles;
    },
  )
  .post(
    `/media/temporary/${entity.type}`,
    loggedMiddleware.needToBeLogged,
    upload(
      "temp_uploads",
      ["mp4", "webm"],
      2 * 80000000,
      2 * 40000000,
      false,
      false,
      true,
    ),
    async (context: Record<string, any>) => {
      context.response.body = context.uploadedFiles;
    },
  );

export default router;
