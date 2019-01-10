export class TsDoc {
  summary?: string;
  description?: string;
  deprecated?: boolean = false;
  parameters: {
    name: string;
    description?: string;
  }[] = [];
  returns: string;

  toString() {
    const result: string[] = [];
    if (this.deprecated) {
      result.push('@deprecated');
    }
    this.pushItemIfNotEmpty(result, this.summary);
    result.push('');
    this.pushItemIfNotEmpty(result, this.description);
    this.parameters.forEach(parameter => {
      if (!this.isNotEmpty(parameter.description)) {
        parameter.description = '';
      }
      this.pushItemIfNotEmpty(result, `@param ${parameter.name} ${parameter.description}`);
    });
    if (this.isNotEmpty(this.returns)) {
      this.pushItemIfNotEmpty(result, `@returns ${this.returns}`);
    }
    return result.join('\n');
  }

  private pushItemIfNotEmpty(array: string[], item?: string) {
    if (this.isNotEmpty(item)) {
      array.push(item);
    }
  }

  private isNotEmpty(string?: string): boolean {
    return string != null && string.trim().length > 0;
  }
}
