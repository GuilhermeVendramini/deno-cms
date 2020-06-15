import { UserRoles } from "../../../../../../core/modules/admin/users/roles/UserRoles.ts";
import {
  Status,
} from "oak";

export default {
  async needToBeAuthor(
    context: Record<string, any>,
    next: Function,
    currentUser: any,
    content: any,
  ) {
    if (
      currentUser._id.$oid != content.author._id.$oid &&
      !currentUser.roles.includes(UserRoles.admin)
    ) {
      context.throw(Status.Unauthorized, "Unauthorized");
    }

    await next();
  },
  async needToBePublished(
    context: Record<string, any>,
    next: Function,
    currentUser: any,
    content: any,
  ) {
    if (!content.published && !currentUser) {
      context.throw(Status.Unauthorized, "Unauthorized");
    }

    await next();
  },
};
