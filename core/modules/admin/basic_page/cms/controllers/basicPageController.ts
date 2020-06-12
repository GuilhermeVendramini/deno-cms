import { renderFileToString } from "dejs";
import currentUserSession from "../../../../../../shared/utils/sessions/currentUserSession.ts";
import { ContentEntity } from "../../../../../entities/ContentEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import basicPageSchema from "../../schemas/basicPageSchema.ts";
import contentRepository from "../../../../../../repositories/mongodb/content/contentRepository.ts";

export default {
  async add(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/basic_page/cms/views/basicPageView.ejs`,
      {
        currentUser: await currentUserSession.get(context),
        message: false,
      },
    );
  },

  async addPost(context: Record<string, any>) {
    try {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const body = await context.request.body();

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let content: ContentEntity | undefined;
      let data: { title: string };
      let title = body.value.get("title");

      data = vs.applySchemaObject(
        basicPageSchema,
        { title },
      );

      if (data) {
        content = new ContentEntity(
          data.title,
          await currentUserSession.get(context),
          Date.now(),
        );
      }

      if (content) {
        await contentRepository.insertOne(content);
        context.response.body = "ok";
        return;
      }
      context.response.body = "error";
      return;
    } catch (error) {
      console.log(error);
      context.response.body = error.message;
    }
  },
};
