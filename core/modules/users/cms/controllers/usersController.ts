import { renderFileToString } from "dejs";
import userRepository from "../../../../../repositories/mongodb/user/userRepository.ts";
import {
  Status,
} from "oak";
import { UserBaseEntity } from "../../entities/UserBaseEntity.ts";
import vs from "value_schema";
import userSchema from "../../schemas/userSchema.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";

export default {
  async list(context: Record<string, any>) {
    try {
      let users: [] | undefined;
      let pageNumber: number = 0;
      let skip = 0;
      let limit = 10;
      let name: string | undefined;
      let status: any | undefined;

      if (context.request.url.searchParams.has("pageNumber")) {
        pageNumber = context.request.url.searchParams.get("pageNumber");
      }

      if (context.request.url.searchParams.has("name")) {
        name = context.request.url.searchParams.get("name");
      }

      if (context.request.url.searchParams.has("status")) {
        status = context.request.url.searchParams.get("status");
      }

      if (status === "true" || status === "false") {
        status = (status === "true");
      } else {
        status = undefined;
      }

      if (!Number(pageNumber)) pageNumber = 0;

      skip = pageNumber * limit;
      users = await userRepository.search(
        name,
        status,
        skip,
        limit,
      );

      let page = {
        users: users,
        error: false,
        message: false,
        pager: {
          next: users && users.length >= limit ? Number(pageNumber) + 1 : false,
          previous: pageNumber == 0 ? false : Number(pageNumber) - 1,
          current: pageNumber == 0 ? 1 : Number(pageNumber) + 1,
        },
        filters: {
          name: name ? name : "",
          status: status,
        },
      };

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/users/cms/views/usersListView.ejs`,
        {
          currentUser: context.getCurrentUser,
          page: page,
        },
      );
    } catch (error) {
      console.log(error.message);

      let page = {
        users: false,
        error: true,
        message: error.message,
        pager: false,
        filters: false,
      };

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/users/cms/views/usersListView.ejs`,
        {
          currentUser: context.getCurrentUser,
          page: page,
        },
      );
    }
  },

  async add(
    context: Record<string, any>,
  ) {
    let id: string = "";

    try {
      id = context.params?.id;
      let user: {} | undefined;

      if (id) {
        user = await userRepository.findOneByID(id);
      }

      let page = {
        id: id,
        user: user,
        error: false,
        message: false,
      };

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/users/cms/views/userFormView.ejs`,
        {
          currentUser: context.getCurrentUser,
          page: page,
        },
      );
      return;
    } catch (error) {
      console.log(error.message);

      let page = {
        id: id,
        user: false,
        error: true,
        message: error.message,
      };
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/users/cms/views/userFormView.ejs`,
        {
          currentUser: context.getCurrentUser,
          page: page,
        },
      );
    }
  },

  async addPost(
    context: Record<string, any>,
  ) {
    let name: string;
    let email: string;
    let password: string;
    let roles: any[];
    let status: boolean = true;
    let page: any;
    let user: UserBaseEntity | undefined;
    let id: string = "";

    try {
      let body = context.getBody;
      let validated: any;

      id = body.value.get("id");
      name = body.value.get("name");
      email = body.value.get("email");
      password = body.value.get("password");
      roles = body.value.get("roles");
      status = body.value.get("status") ? true : false;

      validated = vs.applySchemaObject(
        userSchema,
        {
          name: name,
          email: email,
          password: password,
          roles: roles,
          status: status,
        },
      );

      if (validated) {
        user = new UserBaseEntity(
          validated.name,
          validated.email,
          validated.password,
          validated.roles,
          Date.now(),
          validated.published,
        );

        if (id) {
          await userRepository.updateOne(id, user);
        } else {
          let result = await userRepository.insertOne(user);
          id = result.$oid;
        }

        page = {
          id: id,
          user: user,
          error: false,
          message: false,
        };

        context.response.redirect(`/admin/user/${id}`);
        return;
      }
      context.throw(Status.NotAcceptable, "Not Acceptable");
    } catch (error) {
      if (id) {
        user = await userRepository.findOneByID(id) as UserBaseEntity;
      }

      page = {
        id: id,
        user: user,
        error: true,
        message: error.message,
      };

      console.log(error.message);

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/users/cms/views/userFormView.ejs`,
        {
          currentUser: context.getCurrentUser,
          page: page,
        },
      );
    }
  },

  async view(
    context: Record<string, any>,
  ) {
    try {
      let id = context.params.id;
      let user: any | undefined;
      user = await userRepository.findOneByID(id);

      if (user && Object.keys(user).length != 0) {
        let page = {
          user: user,
          error: false,
          message: false,
        };

        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/users/cms/views/userView.ejs`,
          {
            currentUser: context.getCurrentUser,
            page: page,
          },
        );
        return;
      }
      context.throw(Status.NotFound, "NotFound");
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error.message);
      return;
    }
  },

  async delete(
    context: Record<string, any>,
  ) {
    let id: string = "";

    try {
      id = context.params.id;
      let user: any | undefined;
      user = await userRepository.findOneByID(id);

      if (user && Object.keys(user).length != 0) {
        let page = {
          id: id,
          user: user,
          error: false,
          message: false,
        };

        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/users/cms/views/userFormConfirmDelete.ejs`,
          {
            currentUser: context.getCurrentUser,
            page: page,
          },
        );
        return;
      }
      context.throw(Status.NotFound, "NotFound");
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error.message);
      return;
    }
  },

  async deletePost(
    context: Record<string, any>,
  ) {
    let user: any | undefined;
    let id: string = "";

    try {
      let body = context.getBody;
      id = body.value.get("id");
      user = await userRepository.findOneByID(id);

      if (user && Object.keys(user).length != 0) {
        await userRepository.deleteOne(id);
      }

      context.response.redirect("/admin/users");
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error.message);
      return;
    }
  },
};
