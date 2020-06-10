import currentUserSession from "../utils/sessions/currentUserSession.ts";

export default {
  async needToBeLogged(
    context: Record<string, any>,
    next: Function,
  ) {
    if (!await currentUserSession.getSession(context)) {
      context.response.redirect("/login");
    }
    await next();
  },
  async alreadyLogged(
    context: Record<string, any>,
    next: Function,
  ) {
    if (await currentUserSession.getSession(context)) {
      context.response.redirect("/");
    }
    await next();
  },
};
