import DB from "../db.ts";

const data = DB.collection("recovery_password");

export default {
  async insertOne(recovery: { email: string; hash: string }): Promise<any> {
    return await data.insertOne(recovery);
  },

  async deleteByEmail(email: string): Promise<any> {
    return await data.deleteMany({ email: email });
  },

  async findOneByEmail(email: string): Promise<{}> {
    let result = await data.findOne({ email: email });

    if (result) return result;

    return {};
  },

  async findOneByHash(hash: string): Promise<{}> {
    let result = await data.findOne({ hash: hash });

    if (result) return result;

    return {};
  },
};
