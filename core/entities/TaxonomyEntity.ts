import { BaseEntity } from "./BaseEntity.ts";
import { UserBaseEntity } from "../modules/users/entities/UserBaseEntity.ts";

export type TTaxonomyEntity = {
  title: string;
};

export class ContentEntity extends BaseEntity {
  protected data: TTaxonomyEntity;

  constructor(
    data: TTaxonomyEntity,
    type: string,
    author: UserBaseEntity | undefined,
    created: number,
    published: boolean,
  ) {
    super(
      type,
      author,
      created,
      published,
    );
    this.data = data;
  }
}
