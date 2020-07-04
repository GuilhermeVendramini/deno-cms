import { renderFileToString } from "dejs";
import {
  MediaEntity,
} from "../../../../entities/MediaEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import entityRepository from "../../../../../repositories/mongodb/entity/entityRepository.ts";
import entity from "../../entity.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";
import mediaHelper from "../../../media/utils/mediaHelper.ts";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";
import pathauto from "../../../../../shared/utils/pathauto/defaultPathauto.ts";

const repository = entityRepository.getRepository(entity.bundle);

export default {
  async list(context: Record<string, any>) {
    let media: [] | undefined;
    media = await repository.find(entity.type);
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityListView.ejs`,
      {
        currentUser: context.getCurrentUser,
        media: media,
        entity: entity,
      },
    );
  },

  async add(context: Record<string, any>) {
    try {
      let currentUser = context.getCurrentUser;
      let id: string = context.params?.id;
      let media: {} | undefined;

      if (id) {
        media = await repository.findOneByID(id);
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: false,
          media: media,
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
        "video",
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

      let media: MediaEntity | undefined;
      let path: string | undefined;

      if (validated) {
        path = await pathauto.generate(
          entity.bundle,
          [entity.bundle, entity.type, validated.data.title],
          id,
        );

        media = new MediaEntity(
          validated.data,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );
      }

      if (media && Object.keys(media).length != 0) {
        let result: any;
        let oldVideo: string | undefined;

        if (id) {
          let oldMedia: any = await repository.findOneByID(id);
          oldVideo = oldMedia?.data?.video;
          result = await repository.updateOne(id, media);
        } else {
          result = await repository.insertOne(media);
          id = result?.$oid;
        }

        if (oldVideo && oldVideo != data?.video) {
          await mediaHelper.deleteFile(oldVideo);
        }

        context.response.redirect(path);
        return;
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: "Error saving media. Please try again.",
          media: false,
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
          media: false,
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
      let path: string = context.request.url.pathname;
      let media: any | undefined;
      media = await repository.findOneByFilters({ path: path });

      if (media && Object.keys(media).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}${
            Deno.env.get("THEME")
          }templates/entities/${entity.bundle}/${entity.type}/entityViewDefault.ejs`,
          {
            currentUser: currentUser,
            media: media,
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
      let media: any | undefined;
      media = await repository.findOneByID(id);

      if (media && Object.keys(media).length != 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormConfirmDelete.ejs`,
          {
            currentUser: context.getCurrentUser,
            media: media,
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

      let media: any | undefined;
      media = await repository.findOneByID(id);

      if (media && Object.keys(media).length != 0) {
        await repository.deleteOne(id);

        if (media?.data?.video) {
          await mediaHelper.deleteFile(media.data.video);
        }
      }
      context.response.redirect(
        `/admin/media/${entity.type}`,
      );
      return;
    } catch (error) {
      console.log(error);
      context.response.redirect(
        `/admin/media/${entity.type}`,
      );
      return;
    }
  },
};
