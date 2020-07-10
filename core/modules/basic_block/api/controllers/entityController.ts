import {
  Status,
} from "oak";
import EntityRepository from "../../../../../repositories/mongodb/entity/EntityRepository.ts";
import entity from "../../entity.ts";
import apiErrors from "../../../../../shared/utils/errors/api/apiErrors.ts";

const repository = new EntityRepository("block");

export default {
  async view(context: Record<string, any>) {
    try {
      let id: string | undefined;
      id = context.params.id;
      let block: any | undefined;

      if (id) {
        block = await repository.findOneByID(id, entity.type);
      } else {
        block = await repository.find(entity.type);
      }

      if (block && Object.keys(block).length != 0) {
        context.response.body = block;
        context.response.type = "json";
        return;
      }
      context.throw(Status.BadRequest, "Bad Request");
    } catch (error) {
      await apiErrors.genericError(context, Status.BadRequest, error);
    }
  },
};
