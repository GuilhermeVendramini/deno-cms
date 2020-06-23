import router from "../core/router.ts";

router
  .get("/libraries/:folder/:file", async (context) => {
    const folder = context.params.folder;
    const file = context.params.file;
    const ext = file?.split(".").pop();

    if (ext == "css") {
      context.response.headers.set("Content-Type", "text/css");
    }

    context.response.body = await Deno.readFile(
      `${Deno.cwd()}/libraries/${folder}/${file}`,
    );
  })
  .get("/libraries/ckeditor/:folder/:file", async (context) => {
    const folder = context.params.folder;
    const file = context.params.file;
    const ext = file?.split(".").pop();

    if (ext == "css") {
      context.response.headers.set("Content-Type", "text/css");
    }

    context.response.body = await Deno.readFile(
      `${Deno.cwd()}/libraries/ckeditor/${folder}/${file}`,
    );
  });

export default router;
