import {
  BlockEntity,
} from "../../../../entities/src/BlockEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import EntityRepository from "../../../../../repositories/mongodb/entity/EntityRepository.ts";
import entity from "../../entity.ts";
import pathauto from "../../../../../shared/utils/pathauto/defaultPathauto.ts";
import entityReferenceHelper from "../../../entity_reference/helpers/entityReferenceHelper.ts";

const repository = new EntityRepository(entity.bundle);

export default {
  async list(context: Record<string, any>, next: Function) {
    try {
      let block: any[] | undefined;
      let pageNumber: number = 0;
      let skip = 0;
      let limit = 10;
      let title: string | undefined;
      let published: any | undefined;

      if (context.request.url.searchParams.has("pageNumber")) {
        pageNumber = context.request.url.searchParams.get("pageNumber");
      }

      if (context.request.url.searchParams.has("title")) {
        title = context.request.url.searchParams.get("title");
      }

      if (context.request.url.searchParams.has("published")) {
        published = context.request.url.searchParams.get("published");
      }

      if (published === "true" || published === "false") {
        published = (published === "true");
      } else {
        published = undefined;
      }

      if (!Number(pageNumber)) pageNumber = 0;

      skip = pageNumber * limit;
      block = await repository.search(
        title,
        entity.type,
        published,
        skip,
        limit,
      );

      let page = {
        block: block,
        entity: entity,
        error: false,
        message: false,
        pager: {
          next: block && block.length >= limit ? Number(pageNumber) + 1 : false,
          previous: pageNumber == 0 ? false : Number(pageNumber) - 1,
        },
        filters: {
          title: title ? title : "",
          published: published,
        },
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
    let id: string = "";

    try {
      id = context.params?.id;
      let block: {} | undefined;

      if (id) {
        block = await repository.findOneByID(id);
      }

      let page = {
        id: id,
        block: block,
        entity: entity,
        error: false,
        message: false,
      };

      context["getPage"] = page;
      await next();
    } catch (error) {
      let page = {
        id: id,
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
    let title: string;
    let published: boolean = false;
    let page: any;
    let block: BlockEntity | undefined;
    let id: string = "";

    try {
      let data: any = {};
      let body = context.getBody;
      let currentUser = context.getCurrentUser;
      let validated: any;

      id = body.value.get("id");
      title = body.value.get("title");
      published = body.value.get("published") ? true : false;

      if (entity.fields.length > 0) {
        entity.fields.forEach(function (field: string) {
          data[field] = body.value.get(field);
        });
      }

      if (entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
          references: [],
        };

        let entities = await entityReferenceHelper.addEntityRelation(
          entity.references,
          context,
        );

        Object.keys(entities).map((field) => {
          data[field] = entities[field];
          context["getRelation"]["references"].push(data[field]);
        });
      }

      validated = vs.applySchemaObject(
        entitySchema,
        { title: title, data: data, published: published },
      );

      let path: string | undefined;

      if (validated) {
        path = await pathauto.generate(
          entity.bundle,
          [entity.bundle, entity.type, validated.title],
          id,
        );

        block = new BlockEntity(
          validated.data,
          validated.title,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );

        if (id) {
          await repository.updateOne(id, block);
        } else {
          let result = await repository.insertOne(block);
          id = result.$oid;
        }

        if (entity.references.length > 0) {
          context["getRelation"]["entity"] = {
            id: id,
            bundle: entity.bundle,
            type: entity.type,
          };
        }

        page = {
          id: id,
          block: block,
          entity: entity,
          error: false,
          message: false,
        };

        context["getPage"] = page;
        context["getRedirect"] = path;
        await next();
        return;
      }
      context.throw(Status.NotAcceptable, "Not Acceptable");
    } catch (error) {
      if (id) {
        block = await repository.findOneByID(id) as BlockEntity;
      }

      page = {
        id: id,
        block: block,
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
    let id: string = "";
    let block: any | undefined;

    try {
      id = context.params.id;
      block = await repository.findOneByID(id);

      if (block && Object.keys(block).length != 0) {
        let page = {
          id: id,
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
        id: id,
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
    let id: string = "";
    let block: any | undefined;

    try {
      let body = context.getBody;
      id = body.value.get("id");

      block = await repository.findOneByID(id);

      if (entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
        };
      }

      if (block && Object.keys(block).length != 0) {
        await repository.deleteOne(id);

        if (entity.references.length > 0) {
          context["getRelation"]["entity"] = {
            id: id,
            bundle: entity.bundle,
            type: entity.type,
          };
        }
      }

      let page = {
        id: id,
        block: block,
        entity: entity,
        error: false,
        message: false,
      };

      context["getPage"] = page;
      context["getRedirect"] = path;
      await next();
    } catch (error) {
      console.log(error.message);

      let page = {
        id: id,
        block: block,
        entity: entity,
        error: true,
        message: true,
      };

      context["getPage"] = page;
      context["getRedirect"] = path;
      await next();
    }
  },
};
