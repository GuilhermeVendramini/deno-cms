import { UserBaseEntity } from "../../../core/modules/admin/users/entities/UserBaseEntity.ts";

export default {
  async get(context: Record<string, any>) {
    let currentUser: UserBaseEntity | undefined;

    if (
      context.state.session !== undefined &&
      (currentUser = await context.state.session.get("currentUser"))
    ) {
      return currentUser;
    }

    return undefined;
  },

  async set(context: Record<string, any>, currentUser: UserBaseEntity) {
    await context.state.session.set("currentUser", currentUser);
  },

  async reset(context: Record<string, any>) {
    await context.state.session.set("currentUser", null);
  },
};
