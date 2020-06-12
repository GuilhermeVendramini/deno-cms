import { BaseEntity } from "./BaseEntity.ts";

export class ContentEntity extends BaseEntity {
  protected title: string;

  constructor(
    title: string,
    author: {},
    created: number,
  ) {
    super(
      author,
      created,
    );
    this.title = title;
  }

  getTitle(): string {
    return this.title;
  }
}
