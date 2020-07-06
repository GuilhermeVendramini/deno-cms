import { BaseEntity } from "./BaseEntity.ts";
import { UserBaseEntity } from "../../modules/users/entities/UserBaseEntity.ts";

export class BlockEntity extends BaseEntity {
  protected data: any;

  constructor(
    data: any,
    type: string,
    author: UserBaseEntity | undefined,
    created: number,
    published: boolean,
    path: string,
  ) {
    super(
      type,
      "block",
      author,
      created,
      published,
      path,
    );
    this.data = data;
  }
}