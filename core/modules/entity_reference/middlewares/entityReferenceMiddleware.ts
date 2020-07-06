import { ReferenceEntity } from "../../../entities/src/ReferenceEntity.ts";
import referenceRepository from "../../../../repositories/mongodb/reference/referenceRepository.ts";

export default {
  async add(context: Record<string, any>, next: Function) {
    try {
      let relation: any = context.getRelation;
      await referenceRepository.deleteManyByEntity(relation.entity);
      if (relation?.references && relation?.references?.length > 0) {
        let entityReference: ReferenceEntity;
        relation.references.forEach(function (reference: []) {
          reference.forEach(async function (value: any) {
            entityReference = new ReferenceEntity(
              relation.entity,
              {
                id: value.entity._id.$oid,
                type: value.entity.type,
                bundle: value.entity.bundle,
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

  async delete(context: Record<string, any>, next: Function) {
    try {
      await referenceRepository.deleteManyByEntity(context.getRelation.entity);

      await next();
    } catch (error) {
      console.log(error);
      await next();
    }
  },
};
