import { BaseEntity } from "./BaseEntity.ts";
import { UserBaseEntity } from "../modules/admin/users/entities/UserBaseEntity.ts";

export type TContentEntity = {
  title: string;
  body: string;
};

export class ContentEntity extends BaseEntity {
  protected data: TContentEntity;

  constructor(
    data: TContentEntity,
    type: string,
    author: UserBaseEntity | undefined,
    created: number,
  ) {
    super(
      type,
      author,
      created,
    );
    this.data = data;
  }
}
