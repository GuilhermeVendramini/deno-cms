import { ObjectId } from "mongo";
import EntityRepository from "./EntityRepository.ts";

class MenuItemEntityRepository extends EntityRepository {
  protected db: any;

  constructor() {
    super("menu_item");
  }

  async updateOne(id: string, entity: any): Promise<any> {
    return await this.db.updateOne(
      { _id: ObjectId(id) },
      {
        $set: {
          data: entity.data,
          url: entity.url,
          parent: entity.parent,
          title: entity.title,
          updated: entity.updated,
          published: entity.published,
          path: entity.path,
        },
      },
    );
  }
}

export default MenuItemEntityRepository;
