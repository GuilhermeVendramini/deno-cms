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
import pathauto from "../../../../../shared/utils/pathauto/defaultPathauto.ts";

const repository = entityRepository.getRepository(entity.bundle);

export default {
  async list(context: Record<string, any>, next: Function) {
    try {
      let block: [] | undefined;
      block = await repository.find(entity.type);

      let page = {
        block: block,
        entity: entity,
        error: false,
        message: false,
      };
      context["getPage"] = page;
      await next();
    } catch (error) {
      let page = {
        block: false,
        entity: entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  },

  async add(context: Record<string, any>, next: Function) {
    try {
      let id: string = context.params?.id;
      let block: {} | undefined;

      if (id) {
        block = await repository.findOneByID(id);
      }

      let page = {
        block: block,
        entity: entity,
        error: false,
        message: false,
      };

      context["getPage"] = page;
      await next();
    } catch (error) {
      let page = {
        block: false,
        entity: entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
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

        context["getRedirect"] = path;
        await next();
        return;
      }

      let page = {
        block: { data: data, published: published },
        entity: entity,
        error: true,
        message: "Error saving block. Please try again.",
      };

      context["getPage"] = page;
      await next();
    } catch (error) {
      let page = {
        block: { data: data, published: published },
        entity: entity,
        error: true,
        message: error.message,
      };

      context["getPage"] = page;
      await next();
    }
  },

  async view(context: Record<string, any>, next: Function) {
    try {
      let path: string = context.request.url.pathname;
      let block: any | undefined;
      block = await repository.findOneByFilters({ path: path });

      if (block && Object.keys(block).length != 0) {
        let page = {
          block: block,
          entity: entity,
          error: false,
          message: false,
        };

        context["getPage"] = page;
        await next();
        return;
      }
      context.throw(Status.NotFound, "NotFound");
    } catch (error) {
      let page = {
        block: false,
        entity: entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  },

  async delete(context: Record<string, any>, next: Function) {
    try {
      let id: string = context.params.id;
      let block: any | undefined;
      block = await repository.findOneByID(id);

      if (block && Object.keys(block).length != 0) {
        let page = {
          block: block,
          entity: entity,
          error: false,
          message: false,
        };

        context["getPage"] = page;
        await next();
        return;
      }
      context.throw(Status.NotFound, "NotFound");
    } catch (error) {
      let page = {
        block: false,
        entity: entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  },

  async deletePost(context: Record<string, any>, next: Function) {
    let path = `/admin/${entity.bundle}/${entity.type}`;
    try {
      let body = context.getBody;
      let id: string;
      id = body.value.get("id");

      let block: any | undefined;
      block = await repository.findOneByID(id);

      if (block && Object.keys(block).length != 0) {
        await repository.deleteOne(id);
      }

      context["getRedirect"] = path;
      await next();
    } catch (error) {
      console.log(error);
      context["getRedirect"] = path;
      await next();
    }
  },
};