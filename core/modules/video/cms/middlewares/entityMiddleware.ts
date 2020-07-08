import {
  MediaEntity,
} from "../../../../entities/src/MediaEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import entitySchema from "../../schemas/entitySchema.ts";
import entityRepository from "../../../../../repositories/mongodb/entity/entityRepository.ts";
import entity from "../../entity.ts";
import pathauto from "../../../../../shared/utils/pathauto/defaultPathauto.ts";
import mediaHelper from "../../../media/utils/mediaHelper.ts";

const repository = entityRepository.getRepository(entity.bundle);

export default {
  async list(context: Record<string, any>, next: Function) {
    try {
      let media: [] | undefined;
      media = await repository.find(entity.type);

      let page = {
        media: media,
        entity: entity,
        error: false,
        message: false,
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
      let media: {} | undefined;

      if (id) {
        media = await repository.findOneByID(id);
      }

      let page = {
        id: id,
        media: media,
        entity: entity,
        error: false,
        message: false,
      };

      context["getPage"] = page;
      await next();
    } catch (error) {
      let page = {
        id: id,
        media: false,
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
    let media: MediaEntity | undefined;
    let id: string = "";
    let fileAssist = "";

    try {
      let data: any = {};
      let body = context.getBody;
      let currentUser = context.getCurrentUser;
      let validated: any;
      id = body.value.get("id");
      let properties: any = [
        "title",
        "video",
      ];

      published = body.value.get("published") ? true : false;

      properties.forEach(function (field: string) {
        data[field] = body.value.get(field);
      });

      fileAssist = data["image"];

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

        media = new MediaEntity(
          validated.data,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );

        let oldImage: string | undefined;

        if (id) {
          let oldMedia: any = await repository.findOneByID(id);
          oldImage = oldMedia?.data?.video;
          await repository.updateOne(id, media);
        } else {
          let result = await repository.insertOne(media);
          id = result.$oid;
        }

        if (oldImage && oldImage != data?.video) {
          await mediaHelper.deleteFile(oldImage);
        }

        page = {
          id: id,
          media: media,
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
        media = await repository.findOneByID(id);
      }

      if (fileAssist) {
        await mediaHelper.deleteFile(fileAssist);
      }

      page = {
        id: id,
        media: media,
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
      let media: any | undefined;
      media = await repository.findOneByFilters({ path: path });

      if (media && Object.keys(media).length != 0) {
        let page = {
          media: media,
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
        media: false,
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
      let media: any | undefined;
      media = await repository.findOneByID(id);

      if (media && Object.keys(media).length != 0) {
        let page = {
          id: id,
          media: media,
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
        media: false,
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
    let media: any | undefined;
    let id: string = "";

    try {
      let body = context.getBody;
      id = body.value.get("id");

      media = await repository.findOneByID(id);

      if (media && Object.keys(media).length != 0) {
        await repository.deleteOne(id);

        if (media?.data?.video) {
          await mediaHelper.deleteFile(media.data.video);
        }
      }

      let page = {
        id: id,
        media: media,
        entity: entity,
        error: false,
        message: false,
      };

      context["getPage"] = page;
      context["getRedirect"] = path;
      await next();
    } catch (error) {
      console.log(error);

      let page = {
        id: id,
        media: media,
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
