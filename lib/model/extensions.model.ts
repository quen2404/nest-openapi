export class SpecificationExtensions {
  [extensionName: string]: any;

  static isValidExtension(extensionName: string) {
    return /^x\-/.test(extensionName);
  }

  getExtension(name: string) {
    if (!SpecificationExtensions.isValidExtension(name)) {
      throw new Error("Invalid specification extension: '" + name + "'. Extensions must start with prefix 'x-");
    }
    if (this[name]) {
      return this[name];
    }
    return null;
  }
}
