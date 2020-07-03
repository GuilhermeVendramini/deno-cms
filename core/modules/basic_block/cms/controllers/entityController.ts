import { renderFileToString } from "dejs";
import {
  BlockEntity,
} from "../../../../entities/BlockEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import blockRepository from "../../../../../repositories/mongodb/block/blockRepository.ts";
import entity from "../../entity.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async list(context: Record<string, any>) {
    let block: [] | undefined;
    block = await blockRepository.find(entity.type);
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
        block = await blockRepository.findOneByID(id);
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

      if (validated) {
        block = new BlockEntity(
          validated.data,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
        );
      }

      if (block && Object.keys(block).length != 0) {
        let result: any;

        if (id) {
          result = await blockRepository.updateOne(id, block);
        } else {
          result = await blockRepository.insertOne(block);
          id = result?.$oid;
        }

        context.response.redirect(
          `/admin/${entity.bundle}/${entity.type}`,
        );
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
      let id: string = context.params.id;
      let block: any | undefined;
      block = await blockRepository.findOneByID(id);

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
      block = await blockRepository.findOneByID(id);

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
      block = await blockRepository.findOneByID(id);

      if (block && Object.keys(block).length != 0) {
        await blockRepository.deleteOne(id);
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
