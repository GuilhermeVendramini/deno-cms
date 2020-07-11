import entity from "../../entity.ts";
import entitySchema from "../../schemas/entitySchema.ts";
import mediaEntityMiddleware from "../../../../entities/middlewares/media/mediaEntityMiddleware.ts";
import EntityRepository from "../../../../../repositories/mongodb/entity/EntityRepository.ts";

let repository = new EntityRepository(entity.bundle);

export default {
  async list(context: Record<string, any>, next: Function) {
    return await mediaEntityMiddleware.list(
      context,
      next,
      entity,
      repository,
    );
  },

  async add(context: Record<string, any>, next: Function) {
    return await mediaEntityMiddleware.add(
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
    return await mediaEntityMiddleware.addPost(
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
    return await mediaEntityMiddleware.view(
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
    return await mediaEntityMiddleware.delete(
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
    return await mediaEntityMiddleware.deletePost(
      context,
      next,
      entity,
      repository,
    );
  },
};
