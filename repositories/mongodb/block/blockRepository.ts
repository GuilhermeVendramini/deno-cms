import DB from "../db.ts";
import { ObjectId } from "mongo";

const data = DB.collection("block");

export default {
  async insertOne(block: any): Promise<any> {
    return await data.insertOne(block);
  },

  async updateOne(id: string, block: any): Promise<any> {
    return await data.updateOne(
      { _id: ObjectId(id) },
      {
        $set: {
          data: block.data,
          updated: block.updated,
          published: block.published,
          path: block.path,
        },
      },
    );
  },

  async findOneByID(id: string, type: string = ""): Promise<{}> {
    let result: any;

    if (type != "") {
      result = await data.findOne({ _id: ObjectId(id), type: type });
    } else {
      result = await data.findOne({ _id: ObjectId(id) });
    }

    if (result) return result;

    return {};
  },

  async find(type: string = ""): Promise<[]> {
    let result: any;

    if (type != "") {
      result = await data.find({ type: type });
    } else {
      result = await data.find();
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
  },

  async deleteOne(id: string): Promise<any> {
    return await data.deleteOne({ _id: ObjectId(id) });
  },

  async findOneByFilters(filters: {}): Promise<{}> {
    let result: any;

    result = await data.findOne(filters);

    if (result) return result;

    return {};
  },

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
          searchIndex: { $indexOfCP: ["$data.title", title] },
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

    result = await data.aggregate(aggregate);

    if (result) return result;

    return [];
  },
};
