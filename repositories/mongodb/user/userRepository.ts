import DB from "../db.ts";

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

  async find(): Promise<[]> {
    let result = await data.find();

    if (result) return result;

    return [];
  },
};
