import entityRepository from "../../../../repositories/mongodb/entity/entityRepository.ts";

async function entityLoad(id: string, bundle: string) {
  let repository: any = entityRepository.getRepository(bundle);
  let result: any | undefined;
  result = await repository.findOneByID(id);
  return result;
}

export default {
  async setEntityRelation(references: any[], context: Record<string, any>) {
    let referenceValues = new Array();
    let result: any = {};
    let body = context.getBody;

    for (let field of references) {
      referenceValues = JSON.parse(body.value.get(field));
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
};
