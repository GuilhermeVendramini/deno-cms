export class BaseEntity {
  protected author: {};
  protected created: number;
  protected updated: number;

  constructor(
    author: {},
    created: number,
  ) {
    this.author = author;
    this.created = created;
    this.updated = Date.now();
  }

  getAuthor(): {} {
    return this.author;
  }

  getCreated(): number {
    return this.created;
  }

  getUpdated(): number {
    return this.updated;
  }
}
