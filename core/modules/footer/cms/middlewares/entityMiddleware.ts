import entity from "../../entity.ts";
import entitySchema from "../../schemas/entitySchema.ts";
import MenuItemEntityMiddleware from "../../../../entities/middlewares/menu_item/MenuItemEntityMiddleware.ts";
import MenuItemEntityRepository from "../../../../../repositories/mongodb/entity/MenuItemEntityRepository.ts";
import menuItemHelper from "../../../../entities/helpers/menu_item/menuItemHelper.ts";

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

  async buildMenu(
    context: Record<string, any>,
    next: Function,
  ) {
    if (!context["getPage"]) {
      context["getPage"] = [];
    }

    try {
      let menuTree: any[] = await menuItemHelper.getMenuTree(
        entity.type,
      );
      context["getPage"][entity.type] = menuTree;

      if (!context["getPage"]["currentUrl"]) {
        context["getPage"]["currentUrl"] = context.request.url.pathname;
      }

      await next();
    } catch (error) {
      console.log(error.message);
      context["getPage"][entity.type] = false;
      await next();
    }
  }
}

let entityMiddleware = new EntityMiddleware(entity, repository, entitySchema);

export default entityMiddleware;
