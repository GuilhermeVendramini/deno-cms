import entity from "../../entity.ts";
import entitySchema from "../../schemas/entitySchema.ts";
import MediaEntityMiddleware from "../../../../entities/middlewares/media/MediaEntityMiddleware.ts";
import EntityRepository from "../../../../../repositories/mongodb/entity/EntityRepository.ts";
import { Status } from "oak";
import vs from "value_schema";
import pathauto from "../../../../../shared/utils/pathauto/defaultPathauto.ts";
import entityReferenceHelper from "../../../../modules/entity_reference/helpers/entityReferenceHelper.ts";
import mediaHelper from "../../../../modules/media/helpers/mediaHelper.ts";
import { MediaEntity } from "../../../../entities/src/MediaEntity.ts";
import cropperImageHelper from "../../helpers/cropperImageHelper.ts";

let repository = new EntityRepository(entity.bundle);

class EntityMiddleware extends MediaEntityMiddleware {
  protected entity: any;
  protected repository: any;
  protected entitySchema: any;

  constructor(entity: any, repository: any, entitySchema: any) {
    super(entity, repository, entitySchema);
    this.entity = entity;
    this.repository = repository;
    this.entitySchema = entitySchema;
  }

  async addPost(context: Record<string, any>, next: Function) {
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
      let bodyValue = await body.value;
      let validated: any;

      id = bodyValue.get("id");
      title = bodyValue.get("title");
      file = bodyValue.get("file");
      published = bodyValue.get("published") ? true : false;
      data["file"] = file;

      this.entity.fields.forEach(function (field: string) {
        data[field] = bodyValue.get(field);
      });

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

        media = new MediaEntity(
          validated.data,
          validated.title,
          this.entity.type,
          currentUser,
          Date.now(),
          validated.published,
          path
        );

        let oldFile: string | undefined;
        let oldCropperFiles: string[] | undefined;
        let savedCropperFiles: string[] | undefined;

        if (id) {
          let oldMedia: any = await this.repository.findOneByID(id);
          oldFile = oldMedia?.data?.file;

          if (oldMedia?.data?.cropper) {
            oldCropperFiles = await cropperImageHelper.getAllCropperFiles(
              oldMedia.data.cropper
            );
          }

          await this.repository.updateOne(id, media);
        } else {
          let result = await this.repository.insertOne(media);
          id = result.$oid;
        }

        if (oldFile && oldFile != data?.file) {
          await mediaHelper.deleteFile(oldFile);
        }

        if (data?.cropper) {
          savedCropperFiles = await cropperImageHelper.getAllCropperFiles(
            data.cropper
          );
        }

        if (oldCropperFiles && oldCropperFiles.length > 0) {
          oldCropperFiles.forEach(async (oldFile) => {
            if (!savedCropperFiles || savedCropperFiles.length <= 0) {
              await mediaHelper.deleteFile(oldFile);
              return;
            }

            if (!savedCropperFiles.includes(oldFile)) {
              await mediaHelper.deleteFile(oldFile);
            }
          });
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
          media: media,
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
        media = (await this.repository.findOneByID(id)) as MediaEntity;
      }

      if (!id && file) {
        await mediaHelper.deleteFile(file);
      }

      page = {
        id: id,
        media: media,
        entity: this.entity,
        error: true,
        message: error.message,
      };

      context["getPage"] = page;
      await next();
    }
  }

  async deletePost(context: Record<string, any>, next: Function) {
    let path = `/admin/${this.entity.bundle}/${this.entity.type}`;
    let media: any | undefined;
    let id: string = "";

    try {
      let body = context.getBody;
      let bodyValue = await body.value;

      id = bodyValue.get("id");
      media = await this.repository.findOneByID(id);

      if (this.entity.references.length > 0) {
        context["getRelation"] = {
          entity: {},
        };
      }

      if (media && Object.keys(media).length != 0) {
        await this.repository.deleteOne(id);

        if (media?.data?.file) {
          await mediaHelper.deleteFile(media.data.file);
        }

        let cropperFiles: string[] | undefined;
        if (media?.data?.cropper) {
          cropperFiles = await cropperImageHelper.getAllCropperFiles(
            media.data.cropper
          );
        }

        if (cropperFiles && cropperFiles.length > 0) {
          cropperFiles.forEach(async (file) => {
            await mediaHelper.deleteFile(file);
          });
        }

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
        media: media,
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
        media: media,
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

let entityMiddleware = new EntityMiddleware(entity, repository, entitySchema);

export default entityMiddleware;
