import { BaseEntity } from "./BaseEntity.ts";

export class ContentEntity extends BaseEntity {
  protected title: string;
  protected data: {};

  constructor(
    title: string,
    data: {},
    type: string,
    author: {},
    created: number,
  ) {
    super(
      type,
      author,
      created,
    );
    this.title = title;
    this.data = data;
  }
}
