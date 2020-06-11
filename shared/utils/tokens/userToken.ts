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
  generate(userId: string): string {
    const payload: Payload = {
      uid: userId,
      exp: setExpiration(new Date().getTime() + 60000 * 60),
    };
    return makeJwt({ header, payload, key });
  },
  async validate(token: string) {
    return !!await validateJwt(token, key, { isThrowing: false });
  },
  fetchUserId(token: string) {
    return validateJwtObject(parseAndDecode(token)).payload;
  },
};