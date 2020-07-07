interface IEntity {
  id: string;
  bundle: string;
  type: string;
}

export class ReferenceEntity {
  protected field: string;
  protected entity: IEntity;
  protected reference: IEntity;

  constructor(
    field: string,
    entity: IEntity,
    reference: IEntity,
  ) {
    this.field = field;
    this.entity = entity;
    this.reference = reference;
  }
}
