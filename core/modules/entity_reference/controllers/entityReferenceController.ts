import EntityRepository from "../../../../repositories/mongodb/entity/EntityRepository.ts";

export default {
  async list(context: Record<string, any>) {
    try {
      let bundle: string | undefined;
      let type: string | undefined;
      let skip = 0;
      let limit = 10;
      let title = "";

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

      if (context.request.url.searchParams.has("skip")) {
        skip = Number(context.request.url.searchParams.get("skip"));
      }

      if (context.request.url.searchParams.has("limit")) {
        limit = Number(context.request.url.searchParams.get("limit"));
      }

      if (context.request.url.searchParams.has("title")) {
        title = context.request.url.searchParams.get("title");
      }

      let entities: any | undefined;
      entities = await repository.search(title, type, true, skip, limit);

      let result = {};
      if (entities && Object.keys(entities).length != 0) {
        result = {
          bundle: bundle,
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
