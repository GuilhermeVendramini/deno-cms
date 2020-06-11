import userService from "../../../../../../repositories/mongodb/user/userRepository.ts";

export default {
  async users(context: Record<string, any>) {
    context.response.body = await userService.find();
    context.response.type = "json";
    return;
  },
};
