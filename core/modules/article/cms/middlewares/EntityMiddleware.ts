import entity from "../../entity.ts";
import entitySchema from "../../schemas/entitySchema.ts";
import ContentEntityMiddleware from "../../../../entities/middlewares/content/ContentEntityMiddleware.ts";

class EntityMiddleware extends ContentEntityMiddleware {
  constructor() {
    super(entity, entitySchema);
  }

  /**
   * Add new specific methods here.
   */
}

export default EntityMiddleware;
