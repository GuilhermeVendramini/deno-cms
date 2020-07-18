import { BaseEntity } from "./BaseEntity.ts";
import { UserBaseEntity } from "../../modules/users/entities/UserBaseEntity.ts";

export class MenuItemEntity extends BaseEntity {
  protected data: any;
  protected url: string;

  constructor(
    data: any,
    url: string,
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
      "menu_item",
      author,
      created,
      published,
      path,
    );
    this.data = data;
    this.url = url;
  }
}
