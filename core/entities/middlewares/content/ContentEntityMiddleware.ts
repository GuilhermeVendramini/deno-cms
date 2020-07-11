import {
  ContentEntity,
} from "../../src/ContentEntity.ts";
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

  async add(context: Record<string, any>, next: Function) {
    try {
      let id: string = context.params?.id;
      let content: {} | undefined;

      if (id) {
        content = await EntityMiddleware.repository.findOneByID(id);
      }

      let page = {
        content: content,
        entity: EntityMiddleware.entity,
        error: false,
        message: false,
      };

      context["getPage"] = page;
      await next();
    } catch (error) {
      console.log(error.message);

      let page = {
        content: false,
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
    let content: ContentEntity | undefined;
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

        content = new ContentEntity(
          validated.data,
          validated.title,
          EntityMiddleware.entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );

        if (id) {
          await EntityMiddleware.repository.updateOne(id, content);
        } else {
          let result = await EntityMiddleware.repository.insertOne(content);
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
          content: content,
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
        content = await EntityMiddleware.repository.findOneByID(
          id,
        ) as ContentEntity;
      }

      page = {
        id: id,
        content: content,
        entity: EntityMiddleware.entity,
        error: true,
        message: error.message,
      };

      context["getPage"] = page;
      await next();
    }
  }

  public async view(context: Record<string, any>, next: Function) {
    try {
      let path: string = context.request.url.pathname;
      let content: any | undefined;

      content = await EntityMiddleware.repository.findOneByFilters(
        { path: path },
      );

      if (content && Object.keys(content).length != 0) {
        let page = {
          content: content,
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
        content: false,
        entity: EntityMiddleware.entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  }

  async delete(context: Record<string, any>, next: Function) {
    try {
      let id: string = context.params.id;
      let content: any | undefined;
      content = await EntityMiddleware.repository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        let page = {
          content: content,
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
        content: false,
        entity: EntityMiddleware.entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  }

  async deletePost(context: Record<string, any>, next: Function) {
    let path = `/admin/${EntityMiddleware.entity.bundle}`;
    let content: any | undefined;
    let id: string = "";

    try {
      let body = context.getBody;
      id = body.value.get("id");
      content = await EntityMiddleware.repository.findOneByID(id);

      if (EntityMiddleware.entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
        };
      }

      if (content && Object.keys(content).length != 0) {
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
        content: content,
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
        content: content,
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
