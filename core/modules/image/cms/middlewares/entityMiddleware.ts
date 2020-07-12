import entity from "../../entity.ts";
import entitySchema from "../../schemas/entitySchema.ts";
import MediaEntityMiddleware from "../../../../entities/middlewares/media/MediaEntityMiddleware.ts";
import EntityRepository from "../../../../../repositories/mongodb/entity/EntityRepository.ts";

let repository = new EntityRepository(entity.bundle);

class EntityMiddleware extends MediaEntityMiddleware {
  protected entity: any;
  protected repository: any;
  protected entitySchema: any;

  constructor(entity: any, repository: any, entitySchema: any) {
    super(entity, repository, entitySchema);
    this.entity = entity;
    this.repository = repository;
    this.entitySchema = entitySchema;
  }

  /**
   * Add or change custom methods here!
   */
}

let entityMiddleware = new EntityMiddleware(entity, repository, entitySchema);

export default entityMiddleware;
