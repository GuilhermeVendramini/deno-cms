import { renderFileToString } from "dejs";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";
import { UserBaseEntity } from "../../../../../core/modules/users/entities/UserBaseEntity.ts";

export default {
  async demoUpload(context: any) {
    let currentUser: UserBaseEntity | undefined;
    currentUser = await currentUserSession.get(context);

    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/media/cms/views/mediaDemoUpload.ejs`,
      {
        currentUser: currentUser,
      },
    );
  },

  posUpload(context: any) {
    context.response.body = context.uploadedFiles;
  },
};
