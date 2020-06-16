import taxonomyRepository from "../../../../repositories/mongodb/taxonomy/taxonomyRepository.ts";
import contentRepository from "../../../../repositories/mongodb/content/contentRepository.ts";

export default {
  async list(context: Record<string, any>) {
    try {
      let entity: string | undefined;
      let type: string | undefined;

      entity = context.params.entity;
      type = context.params.type;

      if (!entity && !type) {
        context.response.body = "{}";
        context.response.type = "json";
        return;
      }

      let repository: any | undefined;
      switch (entity) {
        case "taxonomy":
          repository = taxonomyRepository;
          break;

        case "content":
          repository = contentRepository;
          break;
      }

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
          entity: entity,
          type: type,
          data: entities,
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
