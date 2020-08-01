import recoveryPasswordRepository from "../../../../../repositories/mongodb/recovery_password/recoveryPasswordRepository.ts";
import userRepository from "../../../../../repositories/mongodb/user/userRepository.ts";

export default {
  async generateRecoveryPasswordLink(user: any): Promise<string> {
    await recoveryPasswordRepository.deleteByEmail(user.email);

    let hash: string = (user.password + user._id.$oid).replace(/[^\w\s]/gi, "");

    await recoveryPasswordRepository.insertOne(
      { email: user.email, hash: hash },
    );

    return hash;
  },
  async findUserByHash(hash: string) {
    let recovery: any = await recoveryPasswordRepository.findOneByHash(hash);

    if (Object.keys(recovery).length === 0) {
      return false;
    }

    let user: any = await userRepository.findOneByEmail(recovery.email);
    await recoveryPasswordRepository.deleteByEmail(recovery.email);

    if (Object.keys(user).length !== 0) {
      return user;
    }

    return false;
  },
};
