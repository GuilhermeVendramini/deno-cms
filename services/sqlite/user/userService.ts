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
  async selectOneByEmail(email: string): Promise<{}> {
    let result: any = await database.execute(
      `SELECT id, name, email, password FROM users WHERE email = '${email}' LIMIT 1`,
    );

    if (result && (result = result[0])) {
      let user = {
        id: result[0],
        name: result[1],
        email: result[2],
        password: result[3],
      };

      return user;
    }
    return {};
  },
};
