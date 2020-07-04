import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";
import baseEntityMiddleware from "../../../../../shared/middlewares/baseEntityMiddleware.ts";
import cmsMiddleware from "../../../../../shared/middlewares/cmsMiddleware.ts";
import { upload } from "upload";

router
  .get(
    `/admin/${entity.bundle}/${entity.type}`,
    loggedMiddleware.needToBeLogged,
    entityController.list,
  )
  .get(
    `/admin/${entity.bundle}/${entity.type}/add`,
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    `/admin/${entity.bundle}/${entity.type}/edit/:id`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeMediaAuthor,
    entityController.add,
  )
  .get(
    `/${entity.bundle.replace("_", "-")}/${
      entity.type.replace("_", "-")
    }/:title`,
    baseEntityMiddleware.mediaNeedToBePublished,
    entityController.view,
  )
  .post(
    `/admin/${entity.bundle}/${entity.type}/add`,
    loggedMiddleware.needToBeLogged,
    cmsMiddleware.submittedByForm,
    entityController.addPost,
  )
  .get(
    `/admin/${entity.bundle}/${entity.type}/delete/:id`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeMediaAuthor,
    entityController.delete,
  )
  .post(
    `/admin/${entity.bundle}/${entity.type}/delete`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeMediaAuthor,
    cmsMiddleware.submittedByForm,
    entityController.deletePost,
  )
  .post(
    `/${entity.bundle}/${entity.type}`,
    loggedMiddleware.needToBeLogged,
    upload(
      `files/${entity.bundle}/videos`,
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
    `/${entity.bundle}/temporary/${entity.type}`,
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
