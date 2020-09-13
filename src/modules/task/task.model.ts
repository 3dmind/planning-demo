import {
  AllowNull,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { RawTaskModelInterface } from './raw-task-model.interface';

@Table({
  tableName: 'tasks',
  underscored: true,
})
export class TaskModel extends Model<TaskModel>
  implements RawTaskModelInterface {
  @Column({
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    type: DataType.UUIDV4,
  })
  taskId: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
  })
  description: string;

  @AllowNull(false)
  @Column
  createdAt: Date;

  @AllowNull(false)
  @Column
  tickedOff: boolean;

  @AllowNull(true)
  @Column
  tickedOffAt: Date;

  @AllowNull(true)
  @Column
  resumedAt: Date;

  @AllowNull(false)
  @Column
  archived: boolean;

  @AllowNull(true)
  @Column
  archivedAt: Date;
}
