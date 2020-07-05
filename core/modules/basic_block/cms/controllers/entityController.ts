import { renderFileToString } from "dejs";
import {
  BlockEntity,
} from "../../../../entities/src/BlockEntity.ts";
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
  async list(context: Record<string, any>) {
    let block: [] | undefined;
    block = await repository.find(entity.type);
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityListView.ejs`,
      {
        currentUser: context.getCurrentUser,
        block: block,
        entity: entity,
      },
    );
  },

  async add(context: Record<string, any>) {
    try {
      let currentUser = context.getCurrentUser;
      let id: string = context.params?.id;
      let block: {} | undefined;

      if (id) {
        block = await repository.findOneByID(id);
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: false,
          block: block,
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

      let block: BlockEntity | undefined;
      let path: string | undefined;

      if (validated) {
        path = await pathauto.generate(
          entity.bundle,
          [entity.bundle, entity.type, validated.data.title],
          id,
        );

        block = new BlockEntity(
          validated.data,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );
      }

      if (block && Object.keys(block).length != 0) {
        let result: any;

        if (id) {
          result = await repository.updateOne(id, block);
        } else {
          result = await repository.insertOne(block);
          id = result?.$oid;
        }

        context.response.redirect(path);
        return;
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: "Error saving block. Please try again.",
          block: false,
          entity: entity,
        },
      );
      return;
    } catch (error) {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: context.getCurrentUser,
          message: error.message,
          block: false,
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
      let path: string = context.request.url.pathname;
      let block: any | undefined;
      block = await repository.findOneByFilters({ path: path });

      if (block && Object.keys(block).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}${
            Deno.env.get("THEME")
          }templates/entities/${entity.bundle}/${entity.type}/entityViewDefault.ejs`,
          {
            currentUser: currentUser,
            block: block,
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

  async delete(context: Record<string, any>) {
    try {
      let id: string = context.params.id;
      let block: any | undefined;
      block = await repository.findOneByID(id);

      if (block && Object.keys(block).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormConfirmDelete.ejs`,
          {
            currentUser: context.getCurrentUser,
            block: block,
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
      let body = context.getBody;
      let id: string;
      id = body.value.get("id");

      let block: any | undefined;
      block = await repository.findOneByID(id);

      if (block && Object.keys(block).length != 0) {
        await repository.deleteOne(id);
      }
      context.response.redirect(
        `/admin/${entity.bundle}/${entity.type}`,
      );
      return;
    } catch (error) {
      console.log(error);
      context.response.redirect(
        `/admin/${entity.bundle}/${entity.type}`,
      );
      return;
    }
  },
};
