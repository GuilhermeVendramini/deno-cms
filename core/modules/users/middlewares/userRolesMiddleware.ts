import {
  Status,
} from "oak";
import currentUserSession from "../../../../shared/utils/sessions/currentUserSession.ts";
import { UserRoles } from "../roles/UserRoles.ts";

export default {
  async needToHaveRoles(context: Record<string, any>, next: Function, roles: UserRoles[]) {
    if (!context['getCurrentUser']) {
      context['getCurrentUser'] = await currentUserSession.get(context);
    }

    if (
      !context['getCurrentUser'] || 
      !context['getCurrentUser'].roles.some((role: UserRoles) => roles.includes(role))
    ) {
      context.throw(Status.BadRequest, "Bad Request");
    }

    await next();
  },
};
