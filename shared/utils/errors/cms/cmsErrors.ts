import {
  Status,
} from "oak";
import { renderFileToString } from "dejs";

export default {
  async NotFoundError(context: Record<string, any>, status: Status, message: string) {
    console.log(message);
    context.response.status = status;
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/unknownPages/views/notFound.ejs`,
      {},
    );
  },
};
