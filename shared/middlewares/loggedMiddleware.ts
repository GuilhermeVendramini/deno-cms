import currentUserSession from "../utils/sessions/currentUserSession.ts";
import userToken from "../utils/tokens/userToken.ts";

import {
  Status,
} from "oak";

export default {
  async needToBeLogged(
    context: Record<string, any>,
    next: Function,
  ) {

    const currentUser = await currentUserSession.get(context);
    if (!currentUser) {
      context.response.redirect("/login");
      return;
    }

    context['getCurrentUser'] = currentUser;

    await next();
  },

  async alreadyLogged(
    context: Record<string, any>,
    next: Function,
  ) {

    const currentUser = await currentUserSession.get(context);
    if (currentUser) {
      context.response.redirect("/");
    }
    await next();
  },

  async tokenValidated(context: Record<string, any>, next: Function) {
    const authorization = context.request.headers.get("authorization");

    if (!authorization) {
      context.throw(Status.Unauthorized, "Unauthorized");
    }

    const headerToken = authorization.replace("Bearer ", "");
    const isTokenValid = await userToken.validate(headerToken);

    if (!isTokenValid) {
      context.throw(Status.Unauthorized, "Unauthorized");
    }

    await next();
  },
};
