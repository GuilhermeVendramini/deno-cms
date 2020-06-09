import { renderFileToString } from "dejs";

export default {
  async home(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/home/views/homeView.ejs`,
      {},
    );
  }
}