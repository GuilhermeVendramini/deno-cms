import { validateJwt, validateJwtObject, parseAndDecode } from "djwt/validate";
import { makeJwt, setExpiration, Jose, Payload } from "djwt/create";
import { config } from "dotenv";

const env = config();
const key = env.KEY;
const header: Jose = {
  alg: "HS256",
  typ: "JWT",
};

export default {
  async generate(userId: string): Promise<string> {
    const payload: Payload = {
      uid: userId,
      exp: setExpiration(new Date().getTime() + 60000 * 60),
    };
    return await makeJwt({ header, payload, key });
  },
  async validate(token: string) {
    return !!await validateJwt(
      { jwt: token, key: key, algorithm: ["HS256"] },
    );
  },
  fetchUserId(token: string) {
    return validateJwtObject(parseAndDecode(token)).payload;
  },
};
