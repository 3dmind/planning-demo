import { Description } from './description';

export interface TaskProps {
  description: Description;
  createdAt: Date;
  tickedOff: boolean;
  tickedOffAt?: Date;
}
