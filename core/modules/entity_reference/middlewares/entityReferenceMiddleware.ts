import { ReferenceEntity } from "../../../entities/src/ReferenceEntity.ts";
import referenceRepository from "../../../../repositories/mongodb/reference/referenceRepository.ts";
import entityReferenceHelper from "../utils/entityReferenceHelper.ts";

export default {
  async addRelation(context: Record<string, any>, next: Function) {
    try {
      let relation: any = context.getRelation;
      await referenceRepository.deleteManyByEntity(relation.entity);
      if (relation?.references && relation?.references?.length > 0) {
        let entityReference: ReferenceEntity;
        relation.references.forEach(function (reference: []) {
          reference.forEach(async function (value: any) {
            entityReference = new ReferenceEntity(
              value.field,
              relation.entity,
              {
                id: value.entity._id.$oid,
                bundle: value.entity.bundle,
                type: value.entity.type,
              },
            );
            await referenceRepository.insertOne(entityReference);
          });
        });
      }

      await next();
    } catch (error) {
      console.log(error);
      await next();
    }
  },

  async deleteRelation(context: Record<string, any>, next: Function) {
    try {
      await referenceRepository.deleteManyByEntity(context.getRelation.entity);

      await next();
    } catch (error) {
      console.log(error);
      await next();
    }
  },

  async updateRelation(context: Record<string, any>, next: Function) {
    try {
      let page = context.getPage;
      let result: [] | undefined;
      if (!page.error) {
        result = await referenceRepository.findByFilters(
          {
            reference: {
              id: page.id,
              bundle: page.entity.bundle,
              type: page.entity.type,
            },
          },
        );
      }

      if (result) {
        result.forEach((e: any) => entityReferenceHelper.updateEntityWithRelation(e)
        );
      }
      await next();
    } catch (error) {
      console.log(error);
      await next();
    }
  },
};
