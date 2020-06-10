import userModel from "../../models/user/userModel.ts";

export default {
  async getSession(context: Record<string, any>) {
    let currentUser: userModel | undefined;

    if (
      context.state.session !== undefined &&
      (currentUser = await context.state.session.get("currentUser"))
    ) {
      return currentUser;
    }

    return null;
  },
  async setSession(context: Record<string, any>, currentUser: userModel) {
    await context.state.session.set("currentUser", currentUser);
  },
};
