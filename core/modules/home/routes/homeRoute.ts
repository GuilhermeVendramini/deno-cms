import router from "../../../router.ts";
import { renderFileToString } from "dejs";

router
  .get("/", async (context: Record<string, any>) => {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/home/views/home.ejs`,
      {},
    );
  });

export default router;
