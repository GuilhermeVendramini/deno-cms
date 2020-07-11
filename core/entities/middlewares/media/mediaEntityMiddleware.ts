import {
  MediaEntity,
} from "../../src/MediaEntity.ts";
import {
  Status,
} from "oak";
import vs from "value_schema";
import pathauto from "../../../../shared/utils/pathauto/defaultPathauto.ts";
import entityReferenceHelper from "../../../modules/entity_reference/helpers/entityReferenceHelper.ts";
import mediaHelper from "../../../modules/media/utils/mediaHelper.ts";

export default {
  async list(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
  ) {
    try {
      let media: [] | undefined;
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
      media = await repository.search(
        title,
        entity.type,
        published,
        skip,
        limit,
      );

      let page = {
        media: media,
        entity: entity,
        error: false,
        message: false,
        pager: {
          next: media && media.length >= limit ? Number(pageNumber) + 1 : false,
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

  async add(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
  ) {
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

  async addPost(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
    entitySchema: any,
  ) {
    let title: string;
    let published: boolean = false;
    let page: any;
    let media: MediaEntity | undefined;
    let id: string = "";
    let file = "";

    try {
      let data: any = {};
      let body = context.getBody;
      let currentUser = context.getCurrentUser;
      let validated: any;

      id = body.value.get("id");
      title = body.value.get("title");
      file = body.value.get("file");
      published = body.value.get("published") ? true : false;
      data["file"] = file;

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
        { title: title, data: data, published: published },
      );

      let path: string | undefined;

      if (validated) {
        path = await pathauto.generate(
          entity.bundle,
          [entity.bundle, entity.type, validated.title],
          id,
        );

        media = new MediaEntity(
          validated.data,
          validated.title,
          entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path,
        );

        let oldFile: string | undefined;

        if (id) {
          let oldMedia: any = await repository.findOneByID(id);
          oldFile = oldMedia?.data?.file;
          await repository.updateOne(id, media);
        } else {
          let result = await repository.insertOne(media);
          id = result.$oid;
        }

        if (oldFile && oldFile != data?.file) {
          await mediaHelper.deleteFile(oldFile);
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
        media = await repository.findOneByID(id) as MediaEntity;
      }

      if (file) {
        await mediaHelper.deleteFile(file);
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

  async view(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
  ) {
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

  async delete(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
  ) {
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

  async deletePost(
    context: Record<string, any>,
    next: Function,
    entity: any,
    repository: any,
  ) {
    let path = `/admin/${entity.bundle}/${entity.type}`;
    let media: any | undefined;
    let id: string = "";

    try {
      let body = context.getBody;
      id = body.value.get("id");
      media = await repository.findOneByID(id);

      if (entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
        };
      }

      if (media && Object.keys(media).length != 0) {
        await repository.deleteOne(id);

        if (media?.data?.file) {
          await mediaHelper.deleteFile(media.data.file);
        }

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
        media: media,
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
