export class Logger {
  private USER = "UNDEF.USER";
  private ENV = "UNDEF.ENV";
  constructor() {}

  public setEnv(env: string) {
    this.ENV = env;
    return this;
  }
  public setUser(uid: number) {
    this.USER = uid.toString();
  }

  private dateString() {
    return new Date().toISOString();
  }

  public log(file: string, func: string, message: string) {
    let string = this.dateString();
    string += " " + this.ENV;
    string += " " + this.USER;
    string += " in " + file;
    string += " --> " + func;
    string += " -- Details : " + message;
    console.log(string);
  }

  public logError(file: string, func: string, message: string, err: any) {
    this.log(file, func, message);
    console.error(err);
  }
}
