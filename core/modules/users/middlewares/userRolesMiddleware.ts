import {
  Status,
} from "oak";
import currentUserSession from "../../../../shared/utils/sessions/currentUserSession.ts";
import { UserRoles } from "../roles/UserRoles.ts";
import cmsErrors from "../../../../shared/utils/errors/cms/cmsErrors.ts";

export default {
  async needToHaveRoles(context: Record<string, any>, next: Function, roles: UserRoles[]) {
    if (!context['getCurrentUser']) {
      context['getCurrentUser'] = await currentUserSession.get(context);
    }

    if (
      !context['getCurrentUser'] || 
      !context['getCurrentUser'].roles.some((role: UserRoles) => roles.includes(role))
    ) {
      await cmsErrors.NotFoundError(context, Status.NotFound, 'NotFound');
      return;
    }

    await next();
  },
};
