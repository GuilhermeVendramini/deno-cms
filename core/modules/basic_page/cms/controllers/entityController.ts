import { renderFileToString } from "dejs";
import {
  ContentEntity,
} from "../../../../entities/src/ContentEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import entityRepository from "../../../../../repositories/mongodb/entity/entityRepository.ts";
import entity from "../../entity.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";
import pathauto from "../../../../../shared/utils/pathauto/defaultPathauto.ts";

const repository = entityRepository.getRepository(entity.bundle);

export default {
  async add(context: Record<string, any>) {
    try {
      let currentUser = context.getCurrentUser;
      let id: string = context.params?.id;
      let content: {} | undefined;

      if (id) {
        content = await repository.findOneByID(id);
      }

      let page = {
        content: content,
        entity: entity,
        error: false,
        message: false,
      };

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          page: page,
        },
      );
      context.response.status = Status.OK;
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },

  async addPost(context: Record<string, any>, next: Function) {
    let data: any = {};
    let published: boolean = false;

    try {
      let body = context.getBody;
      let currentUser = context.getCurrentUser;
      let validated: any;
      let id: string = body.value.get("id");
      let properties: any = [
        "title",
        "body",
      ];

      published = body.value.get("published") ? true : false;

      properties.forEach(function (field: string) {
        data[field] = body.value.get(field);
      });

      validated = vs.applySchemaObject(
        entitySchema,
        { data: data, published: published },
      );

      let content: ContentEntity | undefined;
      let path: string | undefined;

      if (validated) {
        path = await pathauto.generate(
          entity.bundle,
          [entity.bundle, entity.type, validated.data.title],
          id,
        );

        content = new ContentEntity(
          validated.data,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );
      }

      if (content && Object.keys(content).length != 0) {
        let result: any;

        if (id) {
          result = await repository.updateOne(id, content);
        } else {
          result = await repository.insertOne(content);
          id = result?.$oid;
        }

        context["getRedirect"] = path;

        await next();
        return;
      }

      let page = {
        content: { data: data, published: published },
        entity: entity,
        error: true,
        message: "Error saving content. Please try again.",
      };

      context["getPage"] = page;
      await next();
    } catch (error) {
      let page = {
        content: { data: data, published: published },
        entity: entity,
        error: true,
        message: error.message,
      };

      context["getPage"] = page;
      await next();
    }
  },

  async view(context: Record<string, any>) {
    try {
      let currentUser = await currentUserSession.get(context);
      let path: string = context.request.url.pathname;
      let content: any | undefined;
      content = await repository.findOneByFilters({ path: path });

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
      content = await repository.findOneByID(id);

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
      content = await repository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        await repository.deleteOne(id);
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
