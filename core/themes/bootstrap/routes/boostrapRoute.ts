import router from "../../../router.ts";

router
  .get("/core/themes/boostrap/assets/:folder/:file", async (context) => {
    const folder = context.params.folder;
    const file = context.params.file;
    context.response.body = await Deno.readFile(
      `${Deno.cwd()}/core/themes/bootstrap/assets/${folder}/${file}`,
    );
  });

export default router;
