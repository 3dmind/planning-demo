import * as faker from 'faker';
import { Description } from '../../src/modules/planning/domain/description.valueobject';
import { OwnerId } from '../../src/modules/planning/domain/owner-id.entity';
import { Task } from '../../src/modules/planning/domain/task.entity';
import { UniqueEntityId } from '../../src/shared/domain';

export class TaskEntityBuilder {
  private archived: boolean;
  private archivedAt: Date;
  private createdAt: Date;
  private description: Description;
  private discarded: boolean;
  private discardedAt: Date;
  private editedAt: Date;
  private id: UniqueEntityId;
  private ownerId: OwnerId;
  private resumedAt: Date;
  private tickedOff: boolean;
  private tickedOffAt: Date;

  constructor() {
    const createdAt = new Date();
    const description = Description.create(faker.lorem.words(5)).getValue();
    const entityId = new UniqueEntityId();
    const ownerId = OwnerId.create().getValue();

    this.archived = false;
    this.archivedAt = null;
    this.createdAt = createdAt;
    this.description = description;
    this.discarded = false;
    this.discardedAt = null;
    this.editedAt = null;
    this.id = entityId;
    this.ownerId = ownerId;
    this.resumedAt = null;
    this.tickedOff = false;
    this.tickedOffAt = null;
  }

  withCreationDate(createdAt: Date): TaskEntityBuilder {
    this.createdAt = createdAt;
    return this;
  }

  withDescription(text: string): TaskEntityBuilder {
    this.description = Description.create(text).getValue();
    return this;
  }

  withId(id: UniqueEntityId): TaskEntityBuilder {
    this.id = id;
    return this;
  }

  withOwnerId(ownerId: OwnerId): TaskEntityBuilder {
    this.ownerId = ownerId;
    return this;
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
    this.description = Description.create(newText).getValue();
    this.editedAt = new Date();
    return this;
  }

  makeDiscarded(): TaskEntityBuilder {
    this.discarded = true;
    this.discardedAt = new Date();
    return this;
  }

  build(): Task {
    return Task.create(
      {
        archived: this.archived,
        archivedAt: this.archivedAt,
        createdAt: this.createdAt,
        description: this.description,
        discarded: this.discarded,
        discardedAt: this.discardedAt,
        editedAt: this.editedAt,
        ownerId: this.ownerId,
        resumedAt: this.resumedAt,
        tickedOff: this.tickedOff,
        tickedOffAt: this.tickedOffAt,
      },
      this.id,
    ).getValue();
  }
}
