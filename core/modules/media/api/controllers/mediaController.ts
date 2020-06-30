import {
  Status,
} from "oak";
import apiErrors from "../../../../../shared/utils/errors/api/apiErrors.ts";

export default {
  async deleteTempFile(context: Record<string, any>) {
    try {
      let file: string | undefined;
      file = context.params.file;

      if (file) {
        await Deno.remove(`${Deno.cwd()}/temp_uploads/${file}`);
      }

      context.response.body = { result: true, message: "" };
      context.response.type = "json";
      return;
    } catch (error) {
      await apiErrors.genericError(context, Status.BadRequest, error);
    }
  },
};
