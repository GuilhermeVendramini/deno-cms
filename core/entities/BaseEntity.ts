import { UserBaseEntity } from "../modules/users/entities/UserBaseEntity.ts";

export abstract class BaseEntity {
  protected type: string;
  protected author: UserBaseEntity | undefined;
  protected created: number;
  protected updated: number;
  protected published: boolean;

  constructor(
    type: string,
    author: UserBaseEntity | undefined,
    created: number,
    published: boolean,
  ) {
    this.type = type;
    this.author = author;
    this.created = created;
    this.published = published;
    this.updated = Date.now();
  }
}
