import { TaxonomyEntity } from "../../src/TaxonomyEntity.ts";
import { Status } from "oak";
import vs from "value_schema";
import pathauto from "../../../../shared/utils/pathauto/defaultPathauto.ts";
import entityReferenceHelper from "../../../modules/entity_reference/helpers/entityReferenceHelper.ts";
import cmsErrors from "../../../../shared/utils/errors/cms/cmsErrors.ts";

export default abstract class TaxonomyEntityMiddleware {
  protected entity: any;
  protected repository: any;
  protected entitySchema: any;

  constructor(entity: any, repository: any, entitySchema: any) {
    entity = entity;
    repository = repository;
    entitySchema = entitySchema;
  }

  async list(context: Record<string, any>, next: Function) {
    try {
      let term: [] | undefined;
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
        published = published === "true";
      } else {
        published = undefined;
      }

      if (!Number(pageNumber)) pageNumber = 0;

      skip = pageNumber * limit;
      term = await this.repository.search(
        title,
        this.entity.type,
        published,
        skip,
        limit
      );

      let page = {
        term: term,
        entity: this.entity,
        error: false,
        message: false,
        pager: {
          next: term && term.length >= limit ? Number(pageNumber) + 1 : false,
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
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  }

  async add(context: Record<string, any>, next: Function) {
    try {
      let id: string = context.params?.id;
      let term: {} | undefined;

      if (id) {
        term = await this.repository.findOneByID(id);
      }

      let page = {
        id: id,
        term: term,
        entity: this.entity,
        error: false,
        message: false,
      };

      context["getPage"] = page;
      await next();
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  }

  async addPost(context: Record<string, any>, next: Function) {
    let title: string;
    let published: boolean = false;
    let page: any;
    let term: TaxonomyEntity | undefined;
    let id: string = "";

    try {
      let data: any = {};
      let body = context.getBody;
      let currentUser = context.getCurrentUser;
      let bodyValue = await body.value;
      let validated: any;

      id = bodyValue.get("id");
      title = bodyValue.get("title");
      published = bodyValue.get("published") ? true : false;

      if (this.entity.fields.length > 0) {
        this.entity.fields.forEach(function (field: string) {
          data[field] = bodyValue.get(field);
        });
      }

      if (this.entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
          references: [],
        };

        let entities = await entityReferenceHelper.addEntityRelation(
          this.entity.references,
          context
        );

        Object.keys(entities).map((field) => {
          data[field] = entities[field];
          context["getRelation"]["references"].push(data[field]);
        });
      }

      validated = vs.applySchemaObject(this.entitySchema, {
        title: title,
        data: data,
        published: published,
      });

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

        path = await pathauto.generate(this.entity.bundle, pathPattern, id);

        term = new TaxonomyEntity(
          validated.data,
          validated.title,
          this.entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path
        );

        if (id) {
          await this.repository.updateOne(id, term);
        } else {
          let result = await this.repository.insertOne(term);
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
          term: term,
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
      if (id) {
        term = (await this.repository.findOneByID(id)) as TaxonomyEntity;
      }

      page = {
        id: id,
        term: term,
        entity: this.entity,
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
      let term: any | undefined;
      term = await this.repository.findOneByFilters({ path: path });

      if (term && Object.keys(term).length != 0) {
        let page = {
          term: term,
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
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  }

  async delete(context: Record<string, any>, next: Function) {
    try {
      let id: string = context.params.id;
      let term: any | undefined;
      term = await this.repository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        let page = {
          id: id,
          term: term,
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
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  }

  async deletePost(context: Record<string, any>, next: Function) {
    let path = `/admin/${this.entity.bundle}/${this.entity.type}`;
    let term: any | undefined;
    let id: string = "";

    try {
      let body = context.getBody;
      let bodyValue = await body.value;

      id = bodyValue.get("id");
      term = await this.repository.findOneByID(id);

      if (this.entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
        };
      }

      if (term && Object.keys(term).length != 0) {
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
        term: term,
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
        term: term,
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
