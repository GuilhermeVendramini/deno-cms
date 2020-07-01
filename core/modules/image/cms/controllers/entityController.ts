import { renderFileToString } from "dejs";
import {
  MediaEntity,
} from "../../../../entities/MediaEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import mediaRepository from "../../../../../repositories/mongodb/media/mediaRepository.ts";
import entity from "../../entity.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";
import mediaHelper from "../../../media/utils/mediaHelper.ts";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async list(context: Record<string, any>) {
    let media: [] | undefined;
    media = await mediaRepository.find(entity.type);
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
        media = await mediaRepository.findOneByID(id);
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
      let validated: { title: string };
      let data: any = {};
      let properties: any = [
        "id",
        "title",
        "image",
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

      let media: MediaEntity | undefined;

      if (validated) {
        media = new MediaEntity(
          data,
          entity.type,
          currentUser,
          Date.now(),
          published,
        );
      }

      if (media && Object.keys(media).length != 0) {
        let result: any;
        let id: string;
        let oldImage: string | undefined;

        if (data?.id) {
          id = data.id;
          let oldMedia: any = await mediaRepository.findOneByID(id);
          oldImage = oldMedia?.data?.image;
          result = await mediaRepository.updateOne(id, media);
        } else {
          result = await mediaRepository.insertOne(media);
          id = result?.$oid;
        }

        if (oldImage && oldImage != data?.image) {
          await mediaHelper.deleteFile(oldImage);
        }

        context.response.redirect(
          `/admin/media/${entity.type.replace("_", "-")}`,
        );
        return;
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${entity.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          message: "Error saving media. Please try again.",
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
        },
      );
      context.response.status = Status.OK;
      return;
    }
  },

  async view(context: Record<string, any>) {
    try {
      let currentUser = await currentUserSession.get(context);;
      let id: string = context.params.id;
      let media: any | undefined;
      media = await mediaRepository.findOneByID(id);

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
      media = await mediaRepository.findOneByID(id);

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
      media = await mediaRepository.findOneByID(id);

      if (media && Object.keys(media).length != 0) {
        await mediaRepository.deleteOne(id);

        if (media?.data?.image) {
          await mediaHelper.deleteFile(media.data.image);
        }
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
