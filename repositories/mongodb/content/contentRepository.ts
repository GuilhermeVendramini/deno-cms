import DB from "../db.ts";
import { ObjectId } from "mongo";

const data = DB.collection("content");

export default {
  async insertOne(content: any): Promise<any> {
    return await data.insertOne(content);
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

  async deleteOne(id: string): Promise<any> {
    return await data.deleteOne({ _id: ObjectId(id) });
  },
};
