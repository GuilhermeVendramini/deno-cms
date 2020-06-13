export abstract class BaseEntity {
  protected type: string;
  protected author: {};
  protected created: number;
  protected updated: number;

  constructor(
    type: string,
    author: {},
    created: number,
  ) {
    this.type = type;
    this.author = author;
    this.created = created;
    this.updated = Date.now();
  }
}
