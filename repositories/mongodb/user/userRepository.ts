import DB from "../db.ts";

const data = DB.collection("users");

export default {
  async insert(user: any): Promise<any> {
    return await data.insertOne(user);
  },
  async selectOneByEmail(email: string): Promise<{}> {
    let result = await data.findOne({ email: email });

    if (result) return result;

    return {};
  },
};
