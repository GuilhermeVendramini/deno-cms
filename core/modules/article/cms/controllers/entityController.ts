import { renderFileToString } from "dejs";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";
import {
  ContentEntity,
  TContentEntity,
} from "../../../../entities/ContentEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import contentRepository from "../../../../../repositories/mongodb/content/contentRepository.ts";
import baseEntityMiddleware from "../../../../../shared/middlewares/baseEntityMiddleware.ts";
import { UserBaseEntity } from "../../../../../core/modules/users/entities/UserBaseEntity.ts";

export default {
  async add(context: Record<string, any>, next: Function) {
    try {
      let currentUser: UserBaseEntity | undefined;

      currentUser = await currentUserSession.get(context);

      if (!currentUser) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let id: string = context.params?.id;
      let content: {} | undefined;

      if (id) {
        content = await contentRepository.findOneByID(id);
        await baseEntityMiddleware.needToBeAuthor(
          context,
          next,
          currentUser as UserBaseEntity,
          content,
        );
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/article/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: false,
          content: content,
        },
      );
    } catch (error) {
      context.response.status = Status.NotFound;
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/unknownPages/views/notFound.ejs`,
        {},
      );
      return;
    }
  },

  async addPost(context: Record<string, any>, next: Function) {
    try {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const body = await context.request.body();

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let validated: { title: string };
      let data: any = {};
      let properties: any = [
        "id",
        "title",
        "body",
      ];
      let published: boolean;
      published = body.value.get("published") ? true : false;

      properties.forEach(function (field: string) {
        data[field] = body.value.get(field);
      });

      validated = vs.applySchemaObject(
        entitySchema,
        { title: data.title, published: published },
      );

      let currentUser: UserBaseEntity | undefined;
      currentUser = await currentUserSession.get(context);

      if (!currentUser) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let content: ContentEntity | undefined;

      if (validated) {
        content = new ContentEntity(
          data as TContentEntity,
          "article",
          currentUser,
          Date.now(),
          published,
        );
      }

      if (content && Object.keys(content).length != 0) {
        let result: any;
        let id: string;

        if (data?.id) {
          id = data.id;
          await baseEntityMiddleware.needToBeAuthor(
            context,
            next,
            currentUser as UserBaseEntity,
            content,
          );
          result = await contentRepository.updateOne(data.id, content);
        } else {
          result = await contentRepository.insertOne(content);
          id = result?.$oid;
        }

        context.response.redirect(`/article/${id}`);
        return;
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/article/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: "Error saving content. Please try again.",
        },
      );
      return;
    } catch (error) {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/article/cms/views/entityFormView.ejs`,
        {
          currentUser: await currentUserSession.get(context),
          message: error.message,
          content: false,
        },
      );
      return;
    }
  },

  async view(context: Record<string, any>, next: Function) {
    try {
      let currentUser: UserBaseEntity | undefined;
      currentUser = await currentUserSession.get(context);

      const id: string = context.params.id;
      let content: any | undefined;
      content = await contentRepository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        await baseEntityMiddleware.needToBePublished(
          context,
          next,
          currentUser,
          content,
        );

        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/article/cms/views/entityView.ejs`,
          {
            currentUser: currentUser,
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

  async delete(context: Record<string, any>, next: Function) {
    try {
      let currentUser: UserBaseEntity | undefined;
      currentUser = await currentUserSession.get(context);

      if (!currentUser) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const id: string = context.params.id;
      let content: any | undefined;
      content = await contentRepository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        await baseEntityMiddleware.needToBeAuthor(
          context,
          next,
          currentUser as UserBaseEntity,
          content,
        );

        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/article/cms/views/entityFormConfirm.ejs`,
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

  async deletePost(context: Record<string, any>, next: Function) {
    try {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const body = await context.request.body();

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let currentUser: UserBaseEntity | undefined;
      currentUser = await currentUserSession.get(context);

      if (!currentUser) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let id: string;
      id = body.value.get("id");

      let content: any | undefined;
      content = await contentRepository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        await baseEntityMiddleware.needToBeAuthor(
          context,
          next,
          currentUser as UserBaseEntity,
          content,
        );
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
