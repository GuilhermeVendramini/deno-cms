import { UserBaseEntity } from "./core/modules/admin/users/entities/UserBaseEntity.ts";
import { UserRoles } from "./core/modules/admin/users/roles/UserRoles.ts";
import userRepository from "./repositories/mongodb/user/userRepository.ts";
import * as Colors from "https://deno.land/std/fmt/colors.ts";
import hash from "./shared/utils/hashes/bcryptHash.ts";

let name = "admin";
let email = "admin@admin.com";
let password = "12345678";

try {
  let userAlreadyExists = await userRepository.findOneByEmail(
    email,
  );

  if (Object.keys(userAlreadyExists).length === 0) {
    let passwordHash: string = await hash.bcrypt(password);
    let user = new UserBaseEntity(
      name,
      email,
      passwordHash,
      [UserRoles.admin],
      Date.now(),
    );
    await userRepository.insertOne(user);
  }

  console.info(
    Colors.green(
      `Login: ${email} \nPassword: ${password}\n`,
    ),
    Colors.green(
      "🦕 Installation completed. Press 'Ctrl + c' and run 'denon start' 🦕",
    ),
  );
} catch (error) {
  console.error(
    Colors.red(
      "Installation error. Please check the minimum requirements and try again",
    ),
  );
  console.error(Colors.red(error));
}
