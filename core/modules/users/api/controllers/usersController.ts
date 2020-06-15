import userService from "../../../../../repositories/mongodb/user/userRepository.ts";

export default {
  async users(context: Record<string, any>) {
    let id: string | undefined;
    id = context.params.id;
    let user: any | undefined;

    if (id) {
      user = await userService.findOneById(id);
      delete user.password;
    } else {
      user = await userService.find();
      user = user.map(function (u: any) {
        delete u.password;
        return u;
      });
    }
    context.response.type = "json";
    context.response.body = user;
    return;
  },
};
