import { renderFileToString } from "dejs";
import {
  TaxonomyEntity,
} from "../../../../entities/TaxonomyEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import taxonomyRepository from "../../../../../repositories/mongodb/taxonomy/taxonomyRepository.ts";
import entity from "../../entity.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async list(context: Record<string, any>) {
    let term: [] | undefined;
    term = await taxonomyRepository.find(entity.type);
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityListView.ejs`,
      {
        currentUser: context.getCurrentUser,
        term: term,
        entity: entity,
      },
    );
  },

  async add(context: Record<string, any>) {
    try {
      let currentUser = context.getCurrentUser;
      let id: string = context.params?.id;
      let term: {} | undefined;

      if (id) {
        term = await taxonomyRepository.findOneByID(id);
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: false,
          term: term,
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

      let term: TaxonomyEntity | undefined;

      if (validated) {
        term = new TaxonomyEntity(
          validated.data,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
        );
      }

      if (term && Object.keys(term).length != 0) {
        let result: any;

        if (id) {
          result = await taxonomyRepository.updateOne(id, term);
        } else {
          result = await taxonomyRepository.insertOne(term);
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
          message: "Error saving term. Please try again.",
          term: false,
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
          term: false,
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
      let term: any | undefined;
      term = await taxonomyRepository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}${
            Deno.env.get("THEME")
          }templates/entities/${entity.bundle}/${entity.type}/entityViewDefault.ejs`,
          {
            currentUser: currentUser,
            term: term,
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
      let term: any | undefined;
      term = await taxonomyRepository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormConfirmDelete.ejs`,
          {
            currentUser: context.getCurrentUser,
            term: term,
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

      let term: any | undefined;
      term = await taxonomyRepository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        await taxonomyRepository.deleteOne(id);
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
