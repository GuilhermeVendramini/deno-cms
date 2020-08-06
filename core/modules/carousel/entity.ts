const type: string = "carousel";
const bundle: string = "block";
const name: string = "Carousel";
const fields: string[] = [];
const references: string[] = [
  'items'
];

/**
 * Set true if this entity can be referenced.
 */
const canBeReferenced: boolean = true;

/**
 * PathAuto pattern. Allows String values in the first entity level. 
 * Example: ':title'.
 */
const pathPattern = [
  bundle,
  type,
  ":title",
];

export default {
  type,
  bundle,
  name,
  fields,
  references,
  canBeReferenced,
  pathPattern,
};
