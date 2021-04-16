import { Specification } from './specification.interface';

export class OrSpecification<E> implements Specification<E> {
  constructor(
    private first: Specification<E>,
    private second: Specification<E>,
  ) {}

  public satisfiedBy(entity: E): boolean {
    return this.first.satisfiedBy(entity) || this.second.satisfiedBy(entity);
  }
}
