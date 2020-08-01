import recoveryPasswordRepository from "../../../../../repositories/mongodb/recovery_password/recoveryPasswordRepository.ts";

export default {
  async generateRecoveryPasswordLink(user: any): Promise<string> {
    await recoveryPasswordRepository.deleteByEmail(user.email);

    let hash: string = (user.password + user._id.$oid).replace(/[^\w\s]/gi, '');

    await recoveryPasswordRepository.insertOne(
      { email: user.email, hash: hash },
    );

    return hash;
  },
};
