import entity from "../../entity.ts";
import entitySchema from "../../schemas/entitySchema.ts";
import blockEntityMiddleware from "../../../../entities/middlewares/block/blockEntityMiddleware.ts";
import EntityRepository from "../../../../../repositories/mongodb/entity/EntityRepository.ts";

let repository = new EntityRepository(entity.bundle);

export default {
  async list(context: Record<string, any>, next: Function) {
    return await blockEntityMiddleware.list(
      context,
      next,
      entity,
      repository,
    );
  },

  async add(context: Record<string, any>, next: Function) {
    return await blockEntityMiddleware.add(
      context,
      next,
      entity,
      repository,
    );
  },

  async addPost(
    context: Record<string, any>,
    next: Function,
  ) {
    return await blockEntityMiddleware.addPost(
      context,
      next,
      entity,
      repository,
      entitySchema,
    );
  },

  async view(
    context: Record<string, any>,
    next: Function,
  ) {
    return await blockEntityMiddleware.view(
      context,
      next,
      entity,
      repository,
    );
  },

  async delete(
    context: Record<string, any>,
    next: Function,
  ) {
    return await blockEntityMiddleware.delete(
      context,
      next,
      entity,
      repository,
    );
  },

  async deletePost(
    context: Record<string, any>,
    next: Function,
  ) {
    return await blockEntityMiddleware.deletePost(
      context,
      next,
      entity,
      repository,
    );
  },
};
