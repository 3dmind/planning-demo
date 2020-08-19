import { UseCaseErrorInterface } from './use-case-error.interface';

export abstract class UseCaseErrorAbstract implements UseCaseErrorInterface {
  public readonly message: string;

  protected constructor(message: string) {
    this.message = message;
  }
}
