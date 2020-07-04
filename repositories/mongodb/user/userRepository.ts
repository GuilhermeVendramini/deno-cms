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

  async findOneById(id: string): Promise<{}> {
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
};
