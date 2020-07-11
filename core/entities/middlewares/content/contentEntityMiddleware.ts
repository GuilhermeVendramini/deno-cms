import {
  ContentEntity,
} from "../../src/ContentEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import pathauto from "../../../../shared/utils/pathauto/defaultPathauto.ts";
import entityReferenceHelper from "../../../modules/entity_reference/helpers/entityReferenceHelper.ts";

export default {
  async add(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
  ) {
    try {
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

      context["getPage"] = page;
      await next();
    } catch (error) {
      console.log(error.message);

      let page = {
        content: false,
        entity: entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  },

  async addPost(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
    entitySchema: any,
  ) {
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
          [
            entity.bundle,
            entity.type,
            validated.title,
          ],
          id,
        );

        content = new ContentEntity(
          validated.data,
          validated.title,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );

        if (id) {
          await repository.updateOne(id, content);
        } else {
          let result = await repository.insertOne(content);
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
          content: content,
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
      console.log(error.message);

      if (id) {
        content = await repository.findOneByID(
          id,
        ) as ContentEntity;
      }

      page = {
        id: id,
        content: content,
        entity: entity,
        error: true,
        message: error.message,
      };

      context["getPage"] = page;
      await next();
    }
  },

  async view(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
  ) {
    try {
      let path: string = context.request.url.pathname;
      let content: any | undefined;

      content = await repository.findOneByFilters(
        { path: path },
      );

      if (content && Object.keys(content).length != 0) {
        let page = {
          content: content,
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
      console.log(error.message);

      let page = {
        content: false,
        entity: entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  },

  async delete(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
  ) {
    try {
      let id: string = context.params.id;
      let content: any | undefined;
      content = await repository.findOneByID(id);

      if (content && Object.keys(content).length != 0) {
        let page = {
          content: content,
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
      console.log(error.message);

      let page = {
        content: false,
        entity: entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  },

  async deletePost(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
  ) {
    let path = `/admin/${entity.bundle}`;
    let content: any | undefined;
    let id: string = "";

    try {
      let body = context.getBody;
      id = body.value.get("id");
      content = await repository.findOneByID(id);

      if (entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
        };
      }

      if (content && Object.keys(content).length != 0) {
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
        content: content,
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
        content: content,
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