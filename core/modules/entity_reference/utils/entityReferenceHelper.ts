import entityRepository from "../../../../repositories/mongodb/entity/entityRepository.ts";

export default {
  async entityLoad(id: string, bundle: string) {
    let repository: any = entityRepository.getRepository(bundle);
    let result: any | undefined;
    result = await repository.findOneByID(id);
    return result;
  },
};
