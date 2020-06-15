import DB from "../db.ts";
import { ObjectId } from "mongo";

const data = DB.collection("content");

export default {
  async insertOne(content: any): Promise<any> {
    return await data.insertOne(content);
  },

  async updateOne(id: string, content: any): Promise<any> {
    return await data.updateOne(
      { _id: ObjectId(id) },
      {
        $set: {
          data: content.data,
          updated: content.updated,
          published: content.published,
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
};
