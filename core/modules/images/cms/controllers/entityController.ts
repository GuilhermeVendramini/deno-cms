import { renderFileToString } from "dejs";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";
import {
  MediaEntity,
} from "../../../../entities/MediaEntity.ts";
import { entityType } from "../../types/entityType.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import mediaRepository from "../../../../../repositories/mongodb/media/mediaRepository.ts";
import { UserBaseEntity } from "../../../../../core/modules/users/entities/UserBaseEntity.ts";
import entity from "../../entity.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";

export default {
  async list(context: Record<string, any>) {
    let term: [] | undefined;
    term = await mediaRepository.find(entity.type);
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
        term = await mediaRepository.findOneByID(id);
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

      //data['file'] = context.uploadedFiles;

      validated = vs.applySchemaObject(
        entitySchema,
        { title: data.title, published: published },
      );

      let currentUser: UserBaseEntity | undefined;
      currentUser = await currentUserSession.get(context);

      if (!currentUser) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let term: MediaEntity | undefined;

      if (validated) {
        term = new MediaEntity(
          data as entityType,
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
          result = await mediaRepository.updateOne(id, term);
        } else {
          result = await mediaRepository.insertOne(term);
          id = result?.$oid;
        }

        context.response.redirect(`/admin/media/${entity.type.replace("_", "-")}`);
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
      term = await mediaRepository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityView.ejs`,
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
      term = await mediaRepository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormConfirm.ejs`,
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
      term = await mediaRepository.findOneByID(id);

      if (term && Object.keys(term).length != 0) {
        await mediaRepository.deleteOne(id);
      }
      context.response.redirect(
        `/admin/media/${entity.type.replace("_", "-")}`,
      );
      return;
    } catch (error) {
      console.log(error);
      context.response.redirect(
        `/admin/media/${entity.type.replace("_", "-")}`,
      );
      return;
    }
  },
};
