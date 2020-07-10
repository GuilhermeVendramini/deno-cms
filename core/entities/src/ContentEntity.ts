import { BaseEntity } from "./BaseEntity.ts";
import { UserBaseEntity } from "../../modules/users/entities/UserBaseEntity.ts";

export class ContentEntity extends BaseEntity {
  protected data: any;

  constructor(
    data: any,
    title: string,
    type: string,
    author: UserBaseEntity | undefined,
    created: number,
    published: boolean,
    path: string,
  ) {
    super(
      title,
      type,
      "content",
      author,
      created,
      published,
      path,
    );
    this.data = data;
  }
}
