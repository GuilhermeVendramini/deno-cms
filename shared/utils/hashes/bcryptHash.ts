import * as bcrypt from "bcrypt";

const salt = await bcrypt.genSalt(8);

export default {
  async bcrypt(stringToHash: string): Promise<string> {
    const hash = await bcrypt.hash(stringToHash, salt);
    return hash;
  },
  async verify(hash: string, text: string): Promise<boolean> {
    const result = await bcrypt.compare(text, hash);
    return result;
  },
};