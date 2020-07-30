import EntityRepository from "../../../../repositories/mongodb/entity/EntityRepository.ts";
import referenceRepository from "../../../../repositories/mongodb/reference/referenceRepository.ts";

async function entityLoad(id: string, bundle: string) {
  let repository: any = new EntityRepository(bundle);
  let result: any | undefined;
  result = await repository.findOneByID(id);
  return result;
}

export default {
  async addEntityRelation(references: any[], context: Record<string, any>) {
    let referenceValues = new Array();
    let result: any = {};
    let body = context.getBody;
    let bodyValue = await body.value;

    for (let field of references) {
      referenceValues = JSON.parse(bodyValue.get(field));
      let entities = new Array();
      if (referenceValues && referenceValues.length > 0) {
        for (let value of referenceValues) {
          let loadedEntity: any = await entityLoad(
            value.entity._id.$oid,
            value.entity.bundle,
          );

          if (Object.keys(loadedEntity).length != 0) {
            value.entity = loadedEntity;
            entities.push(value);
          }
        }
      }

      if (entities.length > 0) {
        result[field as string] = entities;
      }
    }

    return result;
  },
  async updateEntityWithRelation(relation: any) {
    try {
      let result: any | undefined;
      let repository: any = new EntityRepository(
        relation.entity.bundle,
      );

      result = await repository.findOneByID(relation.entity.id);
      if (!result || Object.keys(result).length <= 0) {
        return;
      }

      let fieldValues: any[] = result.data[relation.field];
      let loadedEntity: any | undefined;

      fieldValues.forEach(async (value: any, index: number) => {
        if (relation.reference.id == value.entity._id.$oid) {
          loadedEntity = await entityLoad(
            value.entity._id.$oid,
            value.entity.bundle,
          );

          if (loadedEntity && Object.keys(loadedEntity).length != 0) {
            result.data[relation.field][index].entity = loadedEntity;
            await repository.updateOne(relation.entity.id, result);
          } else {
            result.data[relation.field].splice(index, 1);
            await repository.updateOne(relation.entity.id, result);
            await referenceRepository.deleteOne(relation._id.$oid);
          }
        }
      });

      let topLevelReferences = await referenceRepository.findByFilters(
        {
          reference: {
            id: relation.entity.id,
            bundle: relation.entity.bundle,
            type: relation.entity.type,
          },
        },
      );

      if (topLevelReferences && topLevelReferences.length > 0) {
        topLevelReferences.forEach((e: any) =>
          this.updateEntityWithRelation(e)
        );
      }

      return;
    } catch (error) {
      console.log(error.message);
      return;
    }
  },
};
