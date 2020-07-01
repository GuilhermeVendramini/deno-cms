import { renderFileToString } from "dejs";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";
import {
  ContentEntity,
} from "../../../../entities/ContentEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import contentRepository from "../../../../../repositories/mongodb/content/contentRepository.ts";
import { UserBaseEntity } from "../../../../../core/modules/users/entities/UserBaseEntity.ts";
import entity from "../../entity.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";
import entityReferenceHelper from "../../../entity_reference/utils/entityReferenceHelper.ts";

export default {
  async add(context: Record<string, any>) {
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
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const body = await context.request.body();

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let currentUser: any | undefined;
      currentUser = await currentUserSession.get(context);

      if (!currentUser) {
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

      let references: any = [
        "tags",
        "images",
      ];

      let referenceValues: any;

      for (let field of references) {
        let entities = new Array();
        referenceValues = JSON.parse(body.value.get(field));

        for (let value of referenceValues) {
          let entity: any = await entityReferenceHelper.entityLoad(
            value.entity._id.$oid,
            value.entity.bundle,
          );
          value.entity = entity;
          entities.push(value);
        }

        if (entities.length > 0) {
          data[field as string] = entities;
        }
      }

      validated = vs.applySchemaObject(
        entitySchema,
        { title: data.title, published: published },
      );

      let content: ContentEntity | undefined;

      if (validated) {
        content = new ContentEntity(
          data,
          entity.type,
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
          result = await contentRepository.updateOne(id, content);
        } else {
          result = await contentRepository.insertOne(content);
          id = result?.$oid;
        }

        context.response.redirect(`/${entity.type.replace("_", "-")}/${id}`);
        return;
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: "Error saving content. Please try again.",
        },
      );
      return;
    } catch (error) {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: await currentUserSession.get(context),
          message: error.message,
          content: false,
        },
      );
      context.response.status = Status.OK;
      return;
    }
  },

  async view(context: Record<string, any>) {
    try {
      let currentUser: UserBaseEntity | undefined;
      currentUser = await currentUserSession.get(context);

      const id: string = context.params.id;
      let content: any | undefined;
      content = await contentRepository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}${
            Deno.env.get("THEME")
          }templates/entities/${entity.bundle}/${entity.type}/entityViewDefault.ejs`,
          {
            currentUser: currentUser,
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

  async delete(context: Record<string, any>) {
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
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormConfirmDelete.ejs`,
          {
            currentUser: await currentUserSession.get(context),
            content: content,
          },
        );
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
