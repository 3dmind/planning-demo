import { AssigneeId } from './assignee-id.entity';
import { Description } from './description.valueobject';
import { OwnerId } from './owner-id.entity';

export interface TaskProps {
  archived: boolean;
  archivedAt: Date;
  assigneeId: AssigneeId;
  createdAt: Date;
  description: Description;
  discarded: boolean;
  discardedAt: Date;
  editedAt: Date;
  ownerId: OwnerId;
  resumedAt: Date;
  tickedOff: boolean;
  tickedOffAt: Date;
}
