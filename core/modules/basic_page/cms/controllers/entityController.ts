import { renderFileToString } from "dejs";
import {
  ContentEntity,
} from "../../../../entities/ContentEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import contentRepository from "../../../../../repositories/mongodb/content/contentRepository.ts";
import entity from "../../entity.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async add(context: Record<string, any>) {
    try {
      let currentUser = context.getCurrentUser;
      let id: string = context.params?.id;
      let content: {} | undefined;

      if (id) {
        content = await contentRepository.findOneByID(id);
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: false,
          content: content,
          entity: entity,
        },
      );
      context.response.status = Status.OK;
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },

  async addPost(context: Record<string, any>) {
    try {
      let body = context.getBody;
      let currentUser = context.getCurrentUser;
      let validated: any;
      let data: any = {};
      let id: string = body.value.get("id");
      let properties: any = [
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
        { data: data, published: published },
      );

      let content: ContentEntity | undefined;

      if (validated) {
        content = new ContentEntity(
          validated.data,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
        );
      }

      if (content && Object.keys(content).length != 0) {
        let result: any;

        if (id) {
          result = await contentRepository.updateOne(id, content);
        } else {
          result = await contentRepository.insertOne(content);
          id = result?.$oid;
        }

        context.response.redirect(`/${entity.type}/${id}`);
        return;
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: "Error saving content. Please try again.",
          content: false,
          entity: entity,
        },
      );
      context.response.status = Status.OK;
      return;
    } catch (error) {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: context.getCurrentUser,
          message: error.message,
          content: false,
          entity: entity,
        },
      );
      context.response.status = Status.OK;
      return;
    }
  },

  async view(context: Record<string, any>) {
    try {
      let currentUser = await currentUserSession.get(context);
      let id: string = context.params.id;
      let content: any | undefined;
      content = await contentRepository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}${
            Deno.env.get("THEME")
          }templates/entities/${entity.bundle}/${entity.type}/entityViewDefault.ejs`,
          {
            currentUser: currentUser,
            page: {
              content: content,
            },
          },
        );
        context.response.status = Status.OK;
        return;
      }
      context.throw(Status.NotFound, "NotFound");
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },

  async delete(context: Record<string, any>) {
    try {
      let id: string = context.params.id;
      let content: any | undefined;
      content = await contentRepository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormConfirmDelete.ejs`,
          {
            currentUser: context.getCurrentUser,
            content: content,
          },
        );
        context.response.status = Status.OK;
        return;
      }

      context.throw(Status.NotFound, "NotFound");
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },

  async deletePost(context: Record<string, any>) {
    try {
      let body = context.getBody;
      let id: string;
      id = body.value.get("id");

      let content: any | undefined;
      content = await contentRepository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        await contentRepository.deleteOne(id);
      }
      context.response.redirect(`/admin/${entity.bundle}`);
      return;
    } catch (error) {
      console.log(error);
      context.response.redirect(`/admin/${entity.bundle}`);
      return;
    }
  },
};
