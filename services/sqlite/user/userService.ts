import { database } from "../../../bootstrap.ts";

export default {
  async insert(user: any): Promise<any> {
    return await database.execute(
      `INSERT INTO users(name, email, password) VALUES (
        '${user.name}',
        '${user.email}',
        '${user.password}'
      )`,
    );
  },
};
