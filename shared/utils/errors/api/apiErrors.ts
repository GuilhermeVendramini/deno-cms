import {
  Status,
} from "oak";

export default {
  async genericError(context: Record<string, any>, status: Status, error: any) {
    console.log(error);
    context.response.body = { error: error?.message };
    context.response.status = status;
    context.response.type = "json";
  },
};
