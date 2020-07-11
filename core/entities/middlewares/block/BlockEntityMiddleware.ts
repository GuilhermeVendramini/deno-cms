import {
  BlockEntity,
} from "../../../entities/src/BlockEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import EntityRepository from "../../../../repositories/mongodb/entity/EntityRepository.ts";
import pathauto from "../../../../shared/utils/pathauto/defaultPathauto.ts";
import entityReferenceHelper from "../../../modules/entity_reference/helpers/entityReferenceHelper.ts";

abstract class EntityMiddleware {
  private static repository: any;
  private static entitySchema: any;
  private static entity: any;

  constructor(entity: any, entitySchema: any) {
    EntityMiddleware.repository = new EntityRepository(entity.bundle);
    EntityMiddleware.entity = entity;
    EntityMiddleware.entitySchema = entitySchema;
  }

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
      block = await EntityMiddleware.repository.search(
        title,
        EntityMiddleware.entity.type,
        published,
        skip,
        limit,
      );

      let page = {
        block: block,
        entity: EntityMiddleware.entity,
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
      console.log(error.message);

      let page = {
        block: false,
        entity: EntityMiddleware.entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  }

  async add(context: Record<string, any>, next: Function) {
    let id: string = "";

    try {
      id = context.params?.id;
      let block: {} | undefined;

      if (id) {
        block = await EntityMiddleware.repository.findOneByID(id);
      }

      let page = {
        id: id,
        block: block,
        entity: EntityMiddleware.entity,
        error: false,
        message: false,
      };

      context["getPage"] = page;
      await next();
    } catch (error) {
      console.log(error.message);

      let page = {
        id: id,
        block: false,
        entity: EntityMiddleware.entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  }

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

      if (EntityMiddleware.entity.fields.length > 0) {
        EntityMiddleware.entity.fields.forEach(function (field: string) {
          data[field] = body.value.get(field);
        });
      }

      if (EntityMiddleware.entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
          references: [],
        };

        let entities = await entityReferenceHelper.addEntityRelation(
          EntityMiddleware.entity.references,
          context,
        );

        Object.keys(entities).map((field) => {
          data[field] = entities[field];
          context["getRelation"]["references"].push(data[field]);
        });
      }

      validated = vs.applySchemaObject(
        EntityMiddleware.entitySchema,
        { title: title, data: data, published: published },
      );

      let path: string | undefined;

      if (validated) {
        path = await pathauto.generate(
          EntityMiddleware.entity.bundle,
          [
            EntityMiddleware.entity.bundle,
            EntityMiddleware.entity.type,
            validated.title,
          ],
          id,
        );

        block = new BlockEntity(
          validated.data,
          validated.title,
          EntityMiddleware.entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );

        if (id) {
          await EntityMiddleware.repository.updateOne(id, block);
        } else {
          let result = await EntityMiddleware.repository.insertOne(block);
          id = result.$oid;
        }

        if (EntityMiddleware.entity.references.length > 0) {
          context["getRelation"]["entity"] = {
            id: id,
            bundle: EntityMiddleware.entity.bundle,
            type: EntityMiddleware.entity.type,
          };
        }

        page = {
          id: id,
          block: block,
          entity: EntityMiddleware.entity,
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
      console.log(error.message);

      if (id) {
        block = await EntityMiddleware.repository.findOneByID(
          id,
        ) as BlockEntity;
      }

      page = {
        id: id,
        block: block,
        entity: EntityMiddleware.entity,
        error: true,
        message: error.message,
      };

      context["getPage"] = page;
      await next();
    }
  }

  async view(context: Record<string, any>, next: Function) {
    try {
      let path: string = context.request.url.pathname;
      let block: any | undefined;
      block = await EntityMiddleware.repository.findOneByFilters(
        { path: path },
      );

      if (block && Object.keys(block).length != 0) {
        let page = {
          block: block,
          entity: EntityMiddleware.entity,
          error: false,
          message: false,
        };

        context["getPage"] = page;
        await next();
        return;
      }
      context.throw(Status.NotFound, "NotFound");
    } catch (error) {
      console.log(error.message);

      let page = {
        block: false,
        entity: EntityMiddleware.entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  }

  async delete(context: Record<string, any>, next: Function) {
    let id: string = "";
    let block: any | undefined;

    try {
      id = context.params.id;
      block = await EntityMiddleware.repository.findOneByID(id);

      if (block && Object.keys(block).length != 0) {
        let page = {
          id: id,
          block: block,
          entity: EntityMiddleware.entity,
          error: false,
          message: false,
        };

        context["getPage"] = page;
        await next();
        return;
      }
      context.throw(Status.NotFound, "NotFound");
    } catch (error) {
      console.log(error.message);

      let page = {
        id: id,
        block: false,
        entity: EntityMiddleware.entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  }

  async deletePost(context: Record<string, any>, next: Function) {
    let path =
      `/admin/${EntityMiddleware.entity.bundle}/${EntityMiddleware.entity.type}`;
    let id: string = "";
    let block: any | undefined;

    try {
      let body = context.getBody;
      id = body.value.get("id");

      block = await EntityMiddleware.repository.findOneByID(id);

      if (EntityMiddleware.entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
        };
      }

      if (block && Object.keys(block).length != 0) {
        await EntityMiddleware.repository.deleteOne(id);

        if (EntityMiddleware.entity.references.length > 0) {
          context["getRelation"]["entity"] = {
            id: id,
            bundle: EntityMiddleware.entity.bundle,
            type: EntityMiddleware.entity.type,
          };
        }
      }

      let page = {
        id: id,
        block: block,
        entity: EntityMiddleware.entity,
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
        entity: EntityMiddleware.entity,
        error: true,
        message: true,
      };

      context["getPage"] = page;
      context["getRedirect"] = path;
      await next();
    }
  }
}

export default EntityMiddleware;
