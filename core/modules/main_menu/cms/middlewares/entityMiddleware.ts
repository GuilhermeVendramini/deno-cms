import entity from "../../entity.ts";
import entitySchema from "../../schemas/entitySchema.ts";
import MenuItemEntityMiddleware from "../../../../entities/middlewares/menu_item/MenuItemEntityMiddleware.ts";
import MenuItemEntityRepository from "../../../../../repositories/mongodb/entity/MenuItemEntityRepository.ts";

let repository = new MenuItemEntityRepository();

class EntityMiddleware extends MenuItemEntityMiddleware {
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
