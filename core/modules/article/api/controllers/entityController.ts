import {
  Status,
} from "oak";
import EntityRepository from "../../../../../repositories/mongodb/entity/EntityRepository.ts";
import entity from "../../entity.ts";
import apiErrors from "../../../../../shared/utils/errors/api/apiErrors.ts";

const repository = new EntityRepository(entity.bundle);

export default {
  async view(context: Record<string, any>) {
    try {
      let id: string | undefined;
      id = context.params.id;
      let content: any | undefined;

      if (id) {
        content = await repository.findOneByID(id, entity.type);
      } else {
        content = await repository.find(entity.type);
      }

      if (content && Object.keys(content).length != 0) {
        context.response.body = content;
        context.response.type = "json";
        return;
      }
      context.throw(Status.BadRequest, "Bad Request");
    } catch (error) {
      await apiErrors.genericError(context, Status.BadRequest, error);
    }
  },
};
