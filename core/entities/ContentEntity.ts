import { BaseEntity } from "./BaseEntity.ts";
import { UserBaseEntity } from "../modules/users/entities/UserBaseEntity.ts";

export class ContentEntity extends BaseEntity {
  protected data: any;
  protected path: string;

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
      "content",
      author,
      created,
      published,
    );
    this.data = data;
    this.path = path;
  }
}
