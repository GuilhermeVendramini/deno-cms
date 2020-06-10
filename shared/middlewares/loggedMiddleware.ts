import currentUserSession from "../utils/sessions/currentUserSession.ts";

export default {
  async needToBeLogged(
    context: Record<string, any>,
    next: Function,
  ) {
    if (await currentUserSession.getSession(context)) {
      await next();
    }

    context.response.redirect("/login");
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
