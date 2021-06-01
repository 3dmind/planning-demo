import { Specification } from './specification.interface';

export class OrSpecification<E> implements Specification<E> {
  constructor(private readonly first: Specification<E>, private readonly second: Specification<E>) {}

  public satisfiedBy(entity: E): boolean {
    return this.first.satisfiedBy(entity) || this.second.satisfiedBy(entity);
  }
}
