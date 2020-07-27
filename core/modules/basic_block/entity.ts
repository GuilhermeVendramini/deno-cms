const type: string = "basic_block";
const bundle: string = "block";
const name: string = "Basic Block";
const fields: string[] = [
  "body",
];
const references: string[] = [];

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
