import router from "../../../../router.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/media/assets/js/:file",
    loggedMiddleware.needToBeLogged,
    async (context: Record<string, any>) => {
      const file = context.params.file;
      context.response.body = await Deno.readFile(
        `${Deno.cwd()}/core/modules/media/assets/js/${file}`,
      );
    },
  );

export default router;
