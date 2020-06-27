import { BaseEntity } from "./BaseEntity.ts";
import { UserBaseEntity } from "../modules/users/entities/UserBaseEntity.ts";

export class MediaEntity extends BaseEntity {
  protected data: any;

  constructor(
    data: any,
    type: string,
    author: UserBaseEntity | undefined,
    created: number,
    published: boolean,
  ) {
    super(
      type,
      'media',
      author,
      created,
      published,
    );
    this.data = data;
  }
}
