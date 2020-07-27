const type: string = "landing_page";
const bundle: string = "content";
const name: string = "Landing Page";
const fields: string[] = [
  "front",
];
const references: string[] = [
  "references",
];

/**
 * Set true if this entity can be referenced.
 */
const canBeReferenced: boolean = false;

/**
 * PathAuto pattern. Allows String values in the first entity level. 
 * Example: ':title'.
 */
const pathPattern = [
  "home",
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
