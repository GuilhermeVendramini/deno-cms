import {
  Status,
} from "oak";
import contentRepository from "../../../../../repositories/mongodb/content/contentRepository.ts";
import entity from "../../entity.ts";

export default {
  async view(context: Record<string, any>) {
    try {
      let id: string | undefined;
      id = context.params.id;
      let content: any | undefined;

      if (id) {
        content = await contentRepository.findOneByID(id, entity.type);
      } else {
        content = await contentRepository.find(entity.type);
      }

      if (content && Object.keys(content).length != 0) {
        context.response.body = content;
        context.response.type = "json";
        return;
      }
      context.throw(Status.BadRequest, "Bad Request");
    } catch (error) {
      console.log(error);
      context.response.body = { error: error.message };
      context.response.status = Status.BadRequest;
      context.response.type = "json";
    }
  },
};
