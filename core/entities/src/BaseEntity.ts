import { UserBaseEntity } from "../../modules/users/entities/UserBaseEntity.ts";

export abstract class BaseEntity {
  protected title: string;
  protected type: string;
  protected bundle: string;
  protected author: UserBaseEntity | undefined;
  protected created: number;
  protected updated: number;
  protected published: boolean;
  protected path: string;

  constructor(
    title: string,
    type: string,
    bundle: string,
    author: UserBaseEntity | undefined,
    created: number,
    published: boolean,
    path: string,
  ) {
    this.title = title;
    this.type = type;
    this.bundle = bundle;
    this.author = author;
    this.created = created;
    this.published = published;
    this.updated = Date.now();
    this.path = path;
  }
}
