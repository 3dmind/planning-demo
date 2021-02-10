export interface Specification<E> {
  satisfiedBy(entity: E): boolean;
}
