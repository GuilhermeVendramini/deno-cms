import {
  Status,
} from "oak";
import { renderFileToString } from "dejs";

export default async (context: Record<string, any>) => {
  context.response.status = Status.NotFound;
  context.response.body = await renderFileToString(
    `${Deno.cwd()}/core/modules/unknownPages/views/notFound.ejs`,
    {},
  );
};
