import { Description } from './description.valueobject';

export interface TaskProps {
  archived: boolean;
  archivedAt: Date;
  createdAt: Date;
  description: Description;
  discarded: boolean;
  discardedAt: Date;
  editedAt: Date;
  resumedAt: Date;
  tickedOff: boolean;
  tickedOffAt: Date;
}
