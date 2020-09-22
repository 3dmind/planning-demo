import { DescriptionValueObject } from './description.value-object';

export interface TaskPropsInterface {
  archived: boolean;
  archivedAt: Date;
  createdAt: Date;
  description: DescriptionValueObject;
  discarded: boolean;
  discardedAt: Date;
  editedAt: Date;
  resumedAt: Date;
  tickedOff: boolean;
  tickedOffAt: Date;
}
