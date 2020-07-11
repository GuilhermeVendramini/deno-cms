import entity from "../../entity.ts";
import entitySchema from "../../schemas/entitySchema.ts";
import taxonomyEntityMiddleware from "../../../../entities/middlewares/taxonomy/taxonomyEntityMiddleware.ts";
import EntityRepository from "../../../../../repositories/mongodb/entity/EntityRepository.ts";

let repository = new EntityRepository(entity.bundle);

export default {
  async list(context: Record<string, any>, next: Function) {
    return await taxonomyEntityMiddleware.list(
      context,
      next,
      entity,
      repository,
    );
  },

  async add(context: Record<string, any>, next: Function) {
    return await taxonomyEntityMiddleware.add(
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
    return await taxonomyEntityMiddleware.addPost(
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
    return await taxonomyEntityMiddleware.view(
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
    return await taxonomyEntityMiddleware.delete(
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
    return await taxonomyEntityMiddleware.deletePost(
      context,
      next,
      entity,
      repository,
    );
  },
};
