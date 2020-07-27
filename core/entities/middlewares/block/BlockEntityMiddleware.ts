import {
  BlockEntity,
} from "../../src/BlockEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import pathauto from "../../../../shared/utils/pathauto/defaultPathauto.ts";
import entityReferenceHelper from "../../../modules/entity_reference/helpers/entityReferenceHelper.ts";

export default abstract class BlockEntityMiddleware {
  protected entity: any;
  protected repository: any;
  protected entitySchema: any;

  constructor(entity: any, repository: any, entitySchema: any) {
    entity = entity;
    repository = repository;
    entitySchema = entitySchema;
  }

  async list(
    context: Record<string, any>,
    next: Function,
  ) {
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
      block = await this.repository.search(
        title,
        this.entity.type,
        published,
        skip,
        limit,
      );

      let page = {
        block: block,
        entity: this.entity,
        error: false,
        message: false,
        pager: {
          next: block && block.length >= limit ? Number(pageNumber) + 1 : false,
          previous: pageNumber == 0 ? false : Number(pageNumber) - 1,
          current: pageNumber == 0 ? 1 : Number(pageNumber) + 1,
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
        entity: this.entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  }

  async add(
    context: Record<string, any>,
    next: Function,
  ) {
    let id: string = "";

    try {
      id = context.params?.id;
      let block: {} | undefined;

      if (id) {
        block = await this.repository.findOneByID(id);
      }

      let page = {
        id: id,
        block: block,
        entity: this.entity,
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
        entity: this.entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  }

  async addPost(
    context: Record<string, any>,
    next: Function,
  ) {
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

      if (this.entity.fields.length > 0) {
        this.entity.fields.forEach(function (field: string) {
          data[field] = body.value.get(field);
        });
      }

      if (this.entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
          references: [],
        };

        let entities = await entityReferenceHelper.addEntityRelation(
          this.entity.references,
          context,
        );

        Object.keys(entities).map((field) => {
          data[field] = entities[field];
          context["getRelation"]["references"].push(data[field]);
        });
      }

      validated = vs.applySchemaObject(
        this.entitySchema,
        { title: title, data: data, published: published },
      );

      let path: string | undefined;
      let pathPattern: any[] = new Array();

      if (validated) {
        this.entity.pathPattern.forEach((p: any) => {
          if (typeof p === "string" && p.charAt(0) == ":") {
            pathPattern.push(validated[p.substr(1)]);
            return;
          }

          pathPattern.push(p);
        });

        path = await pathauto.generate(
          this.entity.bundle,
          pathPattern,
          id,
        );

        block = new BlockEntity(
          validated.data,
          validated.title,
          this.entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );

        if (id) {
          await this.repository.updateOne(id, block);
        } else {
          let result = await this.repository.insertOne(block);
          id = result.$oid;
        }

        if (this.entity.references.length > 0) {
          context["getRelation"]["entity"] = {
            id: id,
            bundle: this.entity.bundle,
            type: this.entity.type,
          };
        }

        page = {
          id: id,
          block: block,
          entity: this.entity,
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
        block = await this.repository.findOneByID(
          id,
        ) as BlockEntity;
      }

      page = {
        id: id,
        block: block,
        entity: this.entity,
        error: true,
        message: error.message,
      };

      context["getPage"] = page;
      await next();
    }
  }

  async view(
    context: Record<string, any>,
    next: Function,
  ) {
    try {
      let path: string = context.request.url.pathname;
      let block: any | undefined;
      block = await this.repository.findOneByFilters(
        { path: path },
      );

      if (block && Object.keys(block).length != 0) {
        let page = {
          block: block,
          entity: this.entity,
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
        entity: this.entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  }

  async delete(
    context: Record<string, any>,
    next: Function,
  ) {
    let id: string = "";
    let block: any | undefined;

    try {
      id = context.params.id;
      block = await this.repository.findOneByID(id);

      if (block && Object.keys(block).length != 0) {
        let page = {
          id: id,
          block: block,
          entity: this.entity,
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
        entity: this.entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  }

  async deletePost(
    context: Record<string, any>,
    next: Function,
  ) {
    let path = `/admin/${this.entity.bundle}/${this.entity.type}`;
    let id: string = "";
    let block: any | undefined;

    try {
      let body = context.getBody;
      id = body.value.get("id");

      block = await this.repository.findOneByID(id);

      if (this.entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
        };
      }

      if (block && Object.keys(block).length != 0) {
        await this.repository.deleteOne(id);

        if (this.entity.references.length > 0) {
          context["getRelation"]["entity"] = {
            id: id,
            bundle: this.entity.bundle,
            type: this.entity.type,
          };
        }
      }

      let page = {
        id: id,
        block: block,
        entity: this.entity,
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
        entity: this.entity,
        error: true,
        message: true,
      };

      context["getPage"] = page;
      context["getRedirect"] = path;
      await next();
    }
  }
}
