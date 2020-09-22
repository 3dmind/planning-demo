export interface RawTaskModelInterface {
  archived: boolean;
  archivedAt: Date;
  createdAt: Date;
  description: string;
  discarded: boolean;
  discardedAt: Date;
  editedAt: Date;
  resumedAt: Date;
  taskId: string;
  tickedOff: boolean;
  tickedOffAt: Date;
}
