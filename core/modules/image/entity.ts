const type: string = "image";
const bundle: string = "media";
const name: string = "Image";
const fields: string[] = [];
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
