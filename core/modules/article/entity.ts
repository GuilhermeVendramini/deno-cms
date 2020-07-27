const type: string = "article";
const bundle: string = "content";
const name: string = "Article";
const fields: string[] = [
  "body",
];
const references: string[] = [
  "tags",
  "images",
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
