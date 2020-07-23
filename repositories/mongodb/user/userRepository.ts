import DB from "../db.ts";
import { ObjectId } from "mongo";

const data = DB.collection("users");

export default {
  async insertOne(user: any): Promise<any> {
    return await data.insertOne(user);
  },

  async findOneByEmail(email: string): Promise<{}> {
    let result = await data.findOne({ email: email });

    if (result) return result;

    return {};
  },

  async updateOne(id: string, user: any): Promise<any> {
    return await data.updateOne(
      { _id: ObjectId(id) },
      {
        $set: {
          name: user.name,
          email: user.email,
          password: user.password,
          roles: user.roles,
          updated: user.updated,
          status: user.status
        },
      },
    );
  },

  async deleteOne(id: string): Promise<any> {
    return await data.deleteOne({ _id: ObjectId(id) });
  },

  async findOneByID(id: string): Promise<{}> {
    let result = await data.findOne({ _id: ObjectId(id) });

    if (result) return result;

    return {};
  },

  async find(): Promise<[]> {
    let result = await data.find();

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

  async findOneByFilters(filters: {}): Promise<{}> {
    let result: any;

    result = await data.findOne(filters);

    if (result) return result;

    return {};
  },

  async search(
    name: string | undefined,
    status: boolean | undefined,
    skip: number = 0,
    limit = 10,
  ): Promise<[]> {
    let result: any;
    let aggregate: any[] = [
      { $sort: { updated: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    if (name) {
      aggregate.unshift({
        $addFields: {
          searchIndex: { $indexOfCP: ["$name", name] },
        },
      }, {
        $match: {
          searchIndex: { $ne: -1 },
        },
      });
    }

    if (typeof status !== "undefined") {
      aggregate.unshift({ $match: { status: status } });
    }

    result = await data.aggregate(aggregate);

    if (result) return result;

    return [];
  },
};
