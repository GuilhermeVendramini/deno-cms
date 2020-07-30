import router from "../../../router.ts";

router
  .get("/cropper/assets/js/:file", async (context) => {
    const file = context.params.file;

    context.response.body = await Deno.readFile(
      `${Deno.cwd()}/core/modules/cropper/assets/js/${file}`,
    );
  });

export default router;
