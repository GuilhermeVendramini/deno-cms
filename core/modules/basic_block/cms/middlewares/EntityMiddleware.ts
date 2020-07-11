import entity from "../../entity.ts";
import entitySchema from "../../schemas/entitySchema.ts";
import BlockEntityMiddleware from "../../../../entities/middlewares/block/BlockEntityMiddleware.ts";

class EntityMiddleware extends BlockEntityMiddleware {
  constructor() {
    super(entity, entitySchema);
  }

  /**
   * Add new specific methods here.
   */
}

export default EntityMiddleware;
