import { renderFileToString } from "dejs";
import userRepository from "../../../../../repositories/mongodb/user/userRepository.ts";
import {
  Status,
} from "oak";
import { UserBaseEntity } from "../../entities/UserBaseEntity.ts";
import vs from "value_schema";
import userSchema from "../../schemas/userSchema.ts";
import cmsErrors from "../../../../../shared/utils/errors/cms/cmsErrors.ts";
import hash from "../../../../../shared/utils/hashes/bcryptHash.ts";
import { UserRoles } from "../../roles/UserRoles.ts";

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
    let currentUser = context.getCurrentUser;

    try {
      id = context.params?.id;
      let user: {} | undefined;

      if (
        id &&
        id !== currentUser._id.$oid &&
        !currentUser.roles.includes(UserRoles.admin)
      ) {
        await cmsErrors.NotFoundError(context, Status.NotFound, "NotFound");
        return;
      }

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
          currentUser: currentUser,
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
          currentUser: currentUser,
          page: page,
        },
      );
    }
  },

  async addPost(
    context: Record<string, any>,
  ) {
    let name: string = "";
    let email: string = "";
    let password: string = "";
    let roles: any[] = [];
    let status: boolean = true;
    let page: any;
    let user: UserBaseEntity | undefined;
    let id: string = "";
    let currentUser = context.getCurrentUser;

    try {
      let body = context.getBody;
      let bodyValue = await body.value;
      let validated: any;

      id = bodyValue.get("id");
      name = bodyValue.get("name");
      email = bodyValue.get("email");
      password = bodyValue.get("password");
      let password_confirm = bodyValue.get("password_confirm");
      roles = bodyValue.getAll("roles");
      status = bodyValue.get("status") ? true : false;

      if (
        id &&
        id !== currentUser._id.$oid &&
        !currentUser.roles.includes(UserRoles.admin)
      ) {
        await cmsErrors.NotFoundError(context, Status.NotFound, "NotFound");
        return;
      }

      let duplicatedEmail = false;
      let userByEmail: any = await userRepository.findOneByEmail(
        email,
      );

      if (Object.keys(userByEmail).length !== 0) {
        duplicatedEmail = true;
      }

      let oldUserData: any | undefined;
      if (id) {
        oldUserData = await userRepository.findOneByID(id);
      }

      if (
        oldUserData && oldUserData.email == userByEmail.email
      ) {
        duplicatedEmail = false;
      }

      if (duplicatedEmail) {
        context.throw(
          Status.NotAcceptable,
          "We already have a user with this email",
        );
      }

      if (password && password !== password_confirm) {
        context.throw(Status.NotAcceptable, "Passwords do not match");
      }

      let oldPasswordSetted = false;
      if (oldUserData && !password) {
        password = oldUserData.password;
        oldPasswordSetted = true;
      }

      if (oldUserData && roles.length <= 0) {
        roles = oldUserData.roles;
      }

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

      if (!oldPasswordSetted) {
        password = await hash.bcrypt(validated.password);
      }

      if (validated) {
        user = new UserBaseEntity(
          validated.name,
          validated.email,
          password,
          validated.roles,
          Date.now(),
          validated.status,
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
      } else {
        user = new UserBaseEntity(
          name,
          email,
          password,
          roles,
          Date.now(),
          status,
        );
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
          currentUser: currentUser,
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
      let bodyValue = await body.value;

      id = bodyValue.get("id");
      user = await userRepository.findOneByID(id);

      if (user && Object.keys(user).length != 0) {
        await userRepository.deleteOne(id);
      }

      if (id == context.getCurrentUser._id.$oid) {
        context.response.redirect("/logout");
        return;
      }

      context.response.redirect("/admin/users");
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error.message);
      return;
    }
  },
};
