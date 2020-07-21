import router from "../../../../router.ts";
import entityMiddleware from "../middlewares/entityMiddleware.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";
import baseEntityMiddleware from "../../../../../shared/middlewares/baseEntityMiddleware.ts";
import cmsMiddleware from "../../../../../shared/middlewares/cmsMiddleware.ts";
import entityBaseController from "../../../../entities/controllers/entityBaseController.ts";
import entityReferenceMiddleware from "../../../entity_reference/middlewares/entityReferenceMiddleware.ts";
import mainMenuMiddleware from "../../../main_menu/cms/middlewares/entityMiddleware.ts";

let skipMiddleware = async (_: any, next: Function) => {
  await next();
};

router
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
    baseEntityMiddleware.needToBeContentAuthor,
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
    baseEntityMiddleware.contentNeedToBePublished,
    async (
      context: Record<string, any>,
      next: Function,
    ) => {
      await entityMiddleware.view(context, next);
    },
    mainMenuMiddleware.buildMenu,
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
    baseEntityMiddleware.needToBeContentAuthor,
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
    baseEntityMiddleware.needToBeContentAuthor,
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
  );

export default router;
