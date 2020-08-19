import { DescriptionValueObject } from './description.value-object';

export interface TaskPropsInterface {
  createdAt: Date;
  description: DescriptionValueObject;
  resumedAt: Date;
  tickedOff: boolean;
  tickedOffAt: Date;
}
