import EntityRepository from "../../../../repositories/mongodb/entity/EntityRepository.ts";

export default {
  async list(context: Record<string, any>) {
    try {
      let bundle: string | undefined;
      let type: string | undefined;

      bundle = context.params.bundle;
      type = context.params.type;

      if (!bundle && !type) {
        context.response.body = "{}";
        context.response.type = "json";
        return;
      }

      let repository = new EntityRepository(bundle as string);

      if (!repository) {
        context.response.body = "{}";
        context.response.type = "json";
        return;
      }

      let entities: any | undefined;
      entities = await repository.find(type as string);

      let result = {};
      if (entities && Object.keys(entities).length != 0) {
        result = {
          bundle: bundle,
          type: type,
          data: entities.filter((entity: any) => {
            return entity.published === true;
          }),
        };
      }

      context.response.body = result;
      context.response.type = "json";
      return;
    } catch (error) {
      context.response.body = "{}";
      context.response.type = "json";
      return;
    }
  },
};
