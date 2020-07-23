import router from "../../../../router.ts";
import entityMiddleware from "../middlewares/entityMiddleware.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";
import baseEntityMiddleware from "../../../../entities/middlewares/base_entity/baseEntityMiddleware.ts";
import cmsMiddleware from "../../../../../shared/middlewares/cmsMiddleware.ts";
import { upload } from "upload";
import entityBaseController from "../../../../entities/controllers/entityBaseController.ts";
import entityReferenceMiddleware from "../../../entity_reference/middlewares/entityReferenceMiddleware.ts";

const skipMiddleware = async (_: any, next: Function) => {
  await next();
};

const needToBeAuthor =  async (
  context: Record<string, any>,
  next: Function,
) => {
  await baseEntityMiddleware.needToBeAuthor(context, next, entity.bundle);
};

const needToBePublished = async (
  context: Record<string, any>,
  next: Function,
) => {
  await baseEntityMiddleware.needToBePublished(context, next, entity.bundle);
};

router
  .get(
    `/admin/${entity.bundle}/${entity.type}`,
    loggedMiddleware.needToBeLogged,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await entityMiddleware.list(context, next);
    },
    entityBaseController.list,
  )
  .get(
    `/admin/${entity.bundle}/${entity.type}/add`,
    loggedMiddleware.needToBeLogged,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await entityMiddleware.add(context, next);
    },
    entityBaseController.add,
  )
  .get(
    `/admin/${entity.bundle}/${entity.type}/edit/:id`,
    loggedMiddleware.needToBeLogged,
    needToBeAuthor,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await entityMiddleware.add(context, next);
    },
    entityBaseController.add,
  )
  .get(
    `/${entity.bundle}/${entity.type}/:title`,
    needToBePublished,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await entityMiddleware.view(context, next);
    },
    entityBaseController.view,
  )
  .post(
    `/admin/${entity.bundle}/${entity.type}/add`,
    loggedMiddleware.needToBeLogged,
    cmsMiddleware.submittedByForm,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await entityMiddleware.addPost(context, next);
    },
    entity.references.length > 0
      ? entityReferenceMiddleware.addRelation
      : skipMiddleware,
    entity.canBeReferenced ? entityReferenceMiddleware.updateRelatedEntities
    : skipMiddleware,
    entityBaseController.addPost,
  )
  .get(
    `/admin/${entity.bundle}/${entity.type}/delete/:id`,
    loggedMiddleware.needToBeLogged,
    needToBeAuthor,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await entityMiddleware.delete(context, next);
    },
    entityBaseController.delete,
  )
  .post(
    `/admin/${entity.bundle}/${entity.type}/delete`,
    loggedMiddleware.needToBeLogged,
    needToBeAuthor,
    cmsMiddleware.submittedByForm,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await entityMiddleware.deletePost(context, next);
    },
    entity.references.length > 0 ? entityReferenceMiddleware.deleteRelation
    : skipMiddleware,
    entity.canBeReferenced ? entityReferenceMiddleware.updateRelatedEntities
    : skipMiddleware,
    entityBaseController.deletePost,
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
