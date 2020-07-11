import entity from "../../entity.ts";
import entitySchema from "../../schemas/entitySchema.ts";
import contentEntityMiddleware from "../../../../entities/middlewares/content/contentEntityMiddleware.ts";
import EntityRepository from "../../../../../repositories/mongodb/entity/EntityRepository.ts";

let repository = new EntityRepository(entity.bundle);

export default {
  async add(context: Record<string, any>, next: Function) {
    return await contentEntityMiddleware.add(
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
    return await contentEntityMiddleware.addPost(
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
    return await contentEntityMiddleware.view(
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
    return await contentEntityMiddleware.delete(
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
    return await contentEntityMiddleware.deletePost(
      context,
      next,
      entity,
      repository,
    );
  },
};
