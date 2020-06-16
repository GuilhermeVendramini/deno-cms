import router from "../../../router.ts";
import entityReferenceController from "../controllers/entityReferenceController.ts";
import loggedMiddleware from "../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/entity-reference/:entity/:type",
    loggedMiddleware.needToBeLogged,
    entityReferenceController.list,
  )
  .get(
    "/entity-reference/assets/js/:file",
    loggedMiddleware.needToBeLogged,
    async (context: Record<string, any>) => {
      const file = context.params.file;
      context.response.body = await Deno.readFile(
        `${Deno.cwd()}/core/modules/entity_reference/assets/js/${file}`,
      );
    },
  );

export default router;
