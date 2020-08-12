import {
  AllowNull,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'tasks',
  underscored: true,
})
export class TaskModel extends Model<TaskModel> {
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
}
