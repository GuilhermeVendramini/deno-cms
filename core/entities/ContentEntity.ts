import { BaseEntity } from "./BaseEntity.ts";

export type TContentEntity = {
  title: string;
  body: string;
};

export class ContentEntity extends BaseEntity {
  protected data: TContentEntity;

  constructor(
    data: TContentEntity,
    type: string,
    author: {},
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
