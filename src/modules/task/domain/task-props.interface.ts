import { DescriptionValueObject } from './description.value-object';

export interface TaskPropsInterface {
  archived: boolean;
  archivedAt: Date;
  createdAt: Date;
  description: DescriptionValueObject;
  resumedAt: Date;
  tickedOff: boolean;
  tickedOffAt: Date;
}
