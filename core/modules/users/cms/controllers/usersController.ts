import { renderFileToString } from "dejs";
import userService from "../../../../../repositories/mongodb/user/userRepository.ts";

export default {
  async users(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/users/cms/views/usersView.ejs`,
      {
        currentUser: context.getCurrentUser,
        users: await userService.find(),
      },
    );
  },
};
