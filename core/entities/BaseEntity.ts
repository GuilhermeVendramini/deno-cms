import { UserBaseEntity } from "../modules/admin/users/entities/UserBaseEntity.ts";

export abstract class BaseEntity {
  protected type: string;
  protected author: UserBaseEntity | undefined;
  protected created: number;
  protected updated: number;

  constructor(
    type: string,
    author: UserBaseEntity | undefined,
    created: number,
  ) {
    this.type = type;
    this.author = author;
    this.created = created;
    this.updated = Date.now();
  }
}
