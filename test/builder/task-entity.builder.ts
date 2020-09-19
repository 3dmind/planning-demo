import * as faker from 'faker';
import { DescriptionValueObject } from '../../src/modules/task/domain/description.value-object';
import { TaskEntity } from '../../src/modules/task/domain/task.entity';
import { UniqueEntityId } from '../../src/shared/domain';

export class TaskEntityBuilder {
  private archived: boolean;
  private archivedAt: Date;
  private description: DescriptionValueObject;
  private editedAt: Date;
  private readonly createdAt: Date;
  private readonly id: UniqueEntityId;
  private resumedAt: Date;
  private tickedOff: boolean;
  private tickedOffAt: Date;

  constructor(
    text: string = faker.lorem.words(5),
    id?: string,
    createdAt = new Date(),
  ) {
    this.archived = false;
    this.archivedAt = null;
    this.createdAt = createdAt;
    this.description = DescriptionValueObject.create(text).getValue();
    this.editedAt = null;
    this.id = new UniqueEntityId(id);
    this.resumedAt = null;
    this.tickedOff = false;
    this.tickedOffAt = null;
  }

  makeTickedOff(): TaskEntityBuilder {
    this.tickedOff = true;
    this.tickedOffAt = new Date();
    return this;
  }

  makeResumed(): TaskEntityBuilder {
    this.tickedOff = false;
    this.resumedAt = new Date();
    return this;
  }

  makeArchived(): TaskEntityBuilder {
    this.archived = true;
    this.archivedAt = new Date();
    return this;
  }

  makeEdited(newText: string = faker.lorem.words(5)): TaskEntityBuilder {
    this.description = DescriptionValueObject.create(newText).getValue();
    this.editedAt = new Date();
    return this;
  }

  build(): TaskEntity {
    return TaskEntity.create(
      {
        archived: this.archived,
        archivedAt: this.archivedAt,
        createdAt: this.createdAt,
        description: this.description,
        editedAt: this.editedAt,
        resumedAt: this.resumedAt,
        tickedOff: this.tickedOff,
        tickedOffAt: this.tickedOffAt,
      },
      this.id,
    ).getValue();
  }
}
