import userModel from "../../models/user/userModel.ts";

export default {
  async get(context: Record<string, any>) {
    let currentUser: userModel | undefined;

    if (
      context.state.session !== undefined &&
      (currentUser = await context.state.session.get("currentUser"))
    ) {
      return currentUser;
    }

    return null;
  },

  async set(context: Record<string, any>, currentUser: userModel) {
    await context.state.session.set("currentUser", currentUser);
  },

  async reset(context: Record<string, any>) {
    await context.state.session.set("currentUser", null);
  },
};
