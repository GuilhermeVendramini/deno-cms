import {
  TaxonomyEntity,
} from "../../../../entities/src/TaxonomyEntity.ts";
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
        published = (published === "true");
      } else {
        published = undefined;
      }

      if (!Number(pageNumber)) pageNumber = 0;

      skip = pageNumber * limit;
      term = await repository.search(
        title,
        entity.type,
        published,
        skip,
        limit,
      );

      let page = {
        term: term,
        entity: entity,
        error: false,
        message: false,
        pager: {
          next: term && term.length >= limit ? Number(pageNumber) + 1 : false,
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
        media: false,
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
      let term: {} | undefined;

      if (id) {
        term = await repository.findOneByID(id);
      }

      let page = {
        id: id,
        term: term,
        entity: entity,
        error: false,
        message: false,
      };

      context["getPage"] = page;
      await next();
    } catch (error) {
      let page = {
        id: id,
        term: false,
        entity: entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      await next();
    }
  },

  async addPost(context: Record<string, any>, next: Function) {
    let published: boolean = false;
    let page: any;
    let term: TaxonomyEntity | undefined;
    let id: string = "";

    try {
      let data: any = {};
      let body = context.getBody;
      let currentUser = context.getCurrentUser;
      let validated: any;
      id = body.value.get("id");

      published = body.value.get("published") ? true : false;

      entity.fields.forEach(function (field: string) {
        data[field] = body.value.get(field);
      });

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
        { data: data, published: published },
      );

      let path: string | undefined;

      if (validated) {
        path = await pathauto.generate(
          entity.bundle,
          [entity.bundle, entity.type, validated.data.title],
          id,
        );

        term = new TaxonomyEntity(
          validated.data,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );

        if (id) {
          await repository.updateOne(id, term);
        } else {
          let result = await repository.insertOne(term);
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
          term: term,
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
        term = await repository.findOneByID(id) as TaxonomyEntity;
      }

      page = {
        id: id,
        term: term,
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
      let term: any | undefined;
      term = await repository.findOneByFilters({ path: path });

      if (term && Object.keys(term).length != 0) {
        let page = {
          term: term,
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
        term: false,
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

    try {
      id = context.params.id;
      let term: any | undefined;
      term = await repository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        let page = {
          id: id,
          term: term,
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
        term: false,
        entity: entity,
        error: true,
        message: error.message,
      };
      context["getPage"] = page;
      context["getPage"] = page;
      await next();
    }
  },

  async deletePost(context: Record<string, any>, next: Function) {
    let path = `/admin/${entity.bundle}/${entity.type}`;
    let term: any | undefined;
    let id: string = "";

    try {
      let body = context.getBody;
      id = body.value.get("id");
      term = await repository.findOneByID(id);

      if (entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
        };
      }

      if (term && Object.keys(term).length != 0) {
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
        term: term,
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
        term: term,
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
