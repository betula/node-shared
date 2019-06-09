
export class Logger {

  private formatter(values: any): string {
    return values.map((value: any) => (
      (typeof value === "object" && value !== null)
        ? `${JSON.stringify(value)}\n`
        : `${value}`
    )).join(" ");
  }

  public log(...values: any[]) {
    process.stdout.write(`${this.formatter(values)}\n`);
  }

  public error(...values: any[]) {
    process.stderr.write(`${this.formatter(values)}\n`);
  }
}
