import { renderFileToString } from "dejs";
import currentUserSession from "../../../../../../shared/utils/sessions/currentUserSession.ts";
import userService from "../../../../../../repositories/mongodb/user/userRepository.ts";

export default {
  async users(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/users/cms/views/usersView.ejs`,
      {
        currentUser: await currentUserSession.get(context),
        users: await userService.find(),
      },
    );
  },
};
