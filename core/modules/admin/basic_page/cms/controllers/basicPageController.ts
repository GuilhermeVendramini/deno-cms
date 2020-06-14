import { renderFileToString } from "dejs";
import currentUserSession from "../../../../../../shared/utils/sessions/currentUserSession.ts";
import {
  ContentEntity,
  TContentEntity,
} from "../../../../../entities/ContentEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import basicPageSchema from "../../schemas/basicPageSchema.ts";
import contentRepository from "../../../../../../repositories/mongodb/content/contentRepository.ts";

export default {
  async add(context: Record<string, any>) {
    try {
      let id: string = context.params?.id;
      let content: {} | undefined;

      if (id) {
        content = await contentRepository.findOneByID(id);
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/admin/basic_page/cms/views/basicPageFormView.ejs`,
        {
          currentUser: await currentUserSession.get(context),
          message: false,
          content: content,
        },
      );
    } catch (error) {
      context.throw(Status.BadRequest, "Bad Request");
      return;
    }
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
      let validated: { title: string };
      let data: any = {};
      let properties: any = [
        "id",
        "title",
        "body",
      ];

      properties.forEach(function (field: string) {
        data[field] = body.value.get(field);
      });

      validated = vs.applySchemaObject(
        basicPageSchema,
        { title: data.title },
      );

      if (validated) {
        content = new ContentEntity(
          data as TContentEntity,
          "basic_page",
          await currentUserSession.get(context),
          Date.now(),
        );
      }

      if (content) {
        let result: any;
        let id: string;

        if (data?.id) {
          result = await contentRepository.updateOne(data.id, content);
          id = data.id;
        } else {
          result = await contentRepository.insertOne(content);
          id = result?.$oid;
        }

        context.response.redirect(`/basic-page/${id}`);
        return;
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/admin/basic_page/cms/views/basicPageFormView.ejs`,
        {
          currentUser: await currentUserSession.get(context),
          message: "Error saving content. Please try again.",
        },
      );
      return;
    } catch (error) {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/admin/basic_page/cms/views/basicPageFormView.ejs`,
        {
          currentUser: await currentUserSession.get(context),
          message: error.message,
          content: false,
        },
      );
      return;
    }
  },

  async view(context: Record<string, any>) {
    try {
      const id: string = context.params.id;
      let content: {} | undefined;
      content = await contentRepository.findOneByID(id);
      if (content) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/admin/basic_page/cms/views/basicPageView.ejs`,
          {
            currentUser: await currentUserSession.get(context),
            content: content,
          },
        );
        return;
      }

      context.response.status = Status.NotFound;
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/unknownPages/views/notFound.ejs`,
        {},
      );
      return;
    } catch (error) {
      context.response.status = Status.NotFound;
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/unknownPages/views/notFound.ejs`,
        {},
      );
      return;
    }
  },

  async delete(context: Record<string, any>) {
    try {
      const id: string = context.params.id;
      let content: {} | undefined;
      content = await contentRepository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/admin/basic_page/cms/views/basicPageFormConfirm.ejs`,
          {
            currentUser: await currentUserSession.get(context),
            content: content,
          },
        );
        return;
      }

      context.response.status = Status.NotFound;
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/unknownPages/views/notFound.ejs`,
        {},
      );
      return;
    } catch (error) {
      context.response.status = Status.NotFound;
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/unknownPages/views/notFound.ejs`,
        {},
      );
      return;
    }
  },

  async deletePost(context: Record<string, any>) {
    try {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const body = await context.request.body();

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let id: string | undefined;
      id = body.value.get("id");

      if (id) {
        await contentRepository.deleteOne(id);
      }

      context.response.redirect(`/admin/content`);
      return;
    } catch (error) {
      console.log(error);
      context.response.redirect(`/admin/content`);
      return;
    }
  },
};
