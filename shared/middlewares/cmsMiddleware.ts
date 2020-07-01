import {
  Status,
} from "oak";

export default {
  async submittedByForm(context: Record<string, any>, next: Function) {
    if (!context.request.hasBody) {
      context.throw(Status.BadRequest, "Bad Request");
    }

    const body = await context.request.body();

    if (body.type !== "form") {
      context.throw(Status.BadRequest, "Bad Request");
    }

    context["getBody"] = body;

    await next();
  },
};
