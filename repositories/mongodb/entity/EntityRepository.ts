import DB from "../db.ts";
import { ObjectId } from "mongo";

class EntityRepository {
  protected db: any;

  constructor(collection: string) {
    this.db = DB.collection(collection);
  }

  async insertOne(entity: any): Promise<any> {
    return await this.db.insertOne(entity);
  }

  async updateOne(id: string, entity: any): Promise<any> {
    return await this.db.updateOne(
      { _id: ObjectId(id) },
      {
        $set: {
          data: entity.data,
          title: entity.title,
          updated: entity.updated,
          published: entity.published,
          path: entity.path,
        },
      },
    );
  }

  async findOneByID(id: string, type: string = ""): Promise<{}> {
    let result: any;

    if (type != "") {
      result = await this.db.findOne({ _id: ObjectId(id), type: type });
    } else {
      result = await this.db.findOne({ _id: ObjectId(id) });
    }

    if (result) return result;

    return {};
  }

  async find(type: string = ""): Promise<[]> {
    let result: any;

    if (type != "") {
      result = await this.db.find({ type: type });
    } else {
      result = await this.db.find();
    }

    if (result) {
      return result.sort((d1: any, d2: any) => {
        if (d1.updated > d2.updated) {
          return -1;
        }
        if (d1.updated < d2.updated) {
          return 1;
        }
        return 0;
      });
    }

    return [];
  }

  async findByFilters(filters: {}): Promise<[]> {
    let result: any;

    result = await this.db.find(filters);

    if (result) {
      return result.sort((d1: any, d2: any) => {
        if (d1.updated > d2.updated) {
          return -1;
        }
        if (d1.updated < d2.updated) {
          return 1;
        }
        return 0;
      });
    }

    return [];
  }

  async deleteOne(id: string): Promise<any> {
    return await this.db.deleteOne({ _id: ObjectId(id) });
  }

  async findOneByFilters(filters: {}): Promise<{}> {
    let result: any;

    result = await this.db.findOne(filters);

    if (result) return result;

    return {};
  }

  async search(
    title: string | undefined,
    type: string | undefined,
    published: boolean | undefined,
    skip: number = 0,
    limit = 10,
  ): Promise<[]> {
    let result: any;
    let aggregate: any[] = [
      { $sort: { updated: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    if (title) {
      aggregate.unshift({
        $addFields: {
          searchIndex: { $indexOfCP: ["$title", title] },
        },
      }, {
        $match: {
          searchIndex: { $ne: -1 },
        },
      });
    }

    if (typeof published !== "undefined") {
      aggregate.unshift({ $match: { published: published } });
    }

    if (type) {
      aggregate.unshift({ $match: { type: type } });
    }

    result = await this.db.aggregate(aggregate);

    if (result) return result;

    return [];
  }
}

export default EntityRepository;
