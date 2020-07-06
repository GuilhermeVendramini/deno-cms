import {
  TaxonomyEntity,
} from "../../../../entities/src/TaxonomyEntity.ts";
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
      let term: [] | undefined;
      term = await repository.find(entity.type);

      let page = {
        term: term,
        entity: entity,
        error: false,
        message: false,
      };
      context["getPage"] = page;
      await next();
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

  async add(context: Record<string, any>, next: Function) {
    try {
      let id: string = context.params?.id;
      let term: {} | undefined;

      if (id) {
        term = await repository.findOneByID(id);
      }

      let page = {
        term: term,
        entity: entity,
        error: false,
        message: false,
      };

      context["getPage"] = page;
      await next();
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

  async addPost(context: Record<string, any>, next: Function) {
    let data: any = {};
    let published: boolean = false;
    let page: any;
    let term: TaxonomyEntity | undefined;
    let id: string = "";

    try {
      let body = context.getBody;
      let currentUser = context.getCurrentUser;
      let validated: any;
      id = body.value.get("id");
      let properties: any = [
        "title",
      ];

      published = body.value.get("published") ? true : false;

      properties.forEach(function (field: string) {
        data[field] = body.value.get(field);
      });

      term = new TaxonomyEntity(
        data,
        entity.type,
        currentUser,
        Date.now(),
        published,
        "",
      );

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
          await repository.insertOne(term);
        }

        context["getRedirect"] = path;
        await next();
        return;
      }
      context.throw(Status.NotAcceptable, "Not Acceptable");
    } catch (error) {
      if (id) {
        term = await repository.findOneByID(id);
      }

      page = {
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
    try {
      let id: string = context.params.id;
      let term: any | undefined;
      term = await repository.findOneByID(id);

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

  async deletePost(context: Record<string, any>, next: Function) {
    let path = `/admin/${entity.bundle}/${entity.type}`;
    try {
      let body = context.getBody;
      let id: string;
      id = body.value.get("id");

      let term: any | undefined;
      term = await repository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
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
