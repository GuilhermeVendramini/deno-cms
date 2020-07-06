interface IReference {
  id: string;
  bundle: string;
  type: string;
};

export class ReferenceEntity {
  protected entity: IReference;
  protected reference: IReference;

  constructor(
    entity: IReference,
    reference: IReference,
  ) {
    this.entity = entity;
    this.reference = reference;
  }
}
