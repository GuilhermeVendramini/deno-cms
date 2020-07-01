import { renderFileToString } from "dejs";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";
import {
  TaxonomyEntity,
} from "../../../../entities/TaxonomyEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import taxonomyRepository from "../../../../../repositories/mongodb/taxonomy/taxonomyRepository.ts";
import { UserBaseEntity } from "../../../../../core/modules/users/entities/UserBaseEntity.ts";
import entity from "../../entity.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";

export default {
  async list(context: Record<string, any>) {
    let term: [] | undefined;
    term = await taxonomyRepository.find(entity.type);
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityListView.ejs`,
      {
        currentUser: await currentUserSession.get(context),
        term: term,
        entity: entity,
      },
    );
  },

  async add(context: Record<string, any>) {
    try {
      let currentUser: UserBaseEntity | undefined;

      currentUser = await currentUserSession.get(context);

      if (!currentUser) {
        context.throw(Status.BadRequest, "Bad Request");
      }

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
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const body = await context.request.body();

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let validated: { title: string };
      let data: any = {};
      let properties: any = [
        "id",
        "title",
      ];
      let published: boolean;
      published = body.value.get("published") ? true : false;

      properties.forEach(function (field: string) {
        data[field] = body.value.get(field);
      });

      validated = vs.applySchemaObject(
        entitySchema,
        { title: data.title, published: published },
      );

      let currentUser: UserBaseEntity | undefined;
      currentUser = await currentUserSession.get(context);

      if (!currentUser) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let term: TaxonomyEntity | undefined;

      if (validated) {
        term = new TaxonomyEntity(
          data,
          entity.type,
          currentUser,
          Date.now(),
          published,
        );
      }

      if (term && Object.keys(term).length != 0) {
        let result: any;
        let id: string;

        if (data?.id) {
          id = data.id;
          result = await taxonomyRepository.updateOne(id, term);
        } else {
          result = await taxonomyRepository.insertOne(term);
          id = result?.$oid;
        }

        context.response.redirect(
          `/admin/${entity.bundle}/${entity.type.replace("_", "-")}`,
        );
        return;
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: "Error saving term. Please try again.",
        },
      );
      return;
    } catch (error) {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: await currentUserSession.get(context),
          message: error.message,
          term: false,
        },
      );
      context.response.status = Status.OK;
      return;
    }
  },

  async view(context: Record<string, any>) {
    try {
      let currentUser: UserBaseEntity | undefined;
      currentUser = await currentUserSession.get(context);

      const id: string = context.params.id;
      let term: any | undefined;
      term = await taxonomyRepository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}${Deno.env.get('THEME')}templates/entities/${entity.bundle}/${entity.type}/entityViewDefault.ejs`,
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
      let currentUser: UserBaseEntity | undefined;
      currentUser = await currentUserSession.get(context);

      if (!currentUser) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const id: string = context.params.id;
      let term: any | undefined;
      term = await taxonomyRepository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormConfirmDelete.ejs`,
          {
            currentUser: await currentUserSession.get(context),
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
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const body = await context.request.body();

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let currentUser: UserBaseEntity | undefined;
      currentUser = await currentUserSession.get(context);

      if (!currentUser) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let id: string;
      id = body.value.get("id");

      let term: any | undefined;
      term = await taxonomyRepository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        await taxonomyRepository.deleteOne(id);
      }
      context.response.redirect(
        `/admin/${entity.bundle}/${entity.type.replace("_", "-")}`,
      );
      return;
    } catch (error) {
      console.log(error);
      context.response.redirect(
        `/admin/${entity.bundle}/${entity.type.replace("_", "-")}`,
      );
      return;
    }
  },
};
