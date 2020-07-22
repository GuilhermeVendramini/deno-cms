import {
  Status,
} from "oak";
import currentUserSession from "../utils/sessions/currentUserSession.ts";

export default {
  async needToBeAdmin(context: Record<string, any>, next: Function) {
    if (!context['getCurrentUser']) {
      context['getCurrentUser'] = await currentUserSession.get(context);
    }

    if (!context['getCurrentUser'] || !context['getCurrentUser'].roles.includes(0)) {
      context.throw(Status.BadRequest, "Bad Request");
    }

    await next();
  },
};
