import { Injectable } from '@nestjs/common';
import { Result } from '../../../../shared/core';
import { Description } from '../description.valueobject';
import { Member } from '../member.entity';
import { Task } from '../task.entity';

@Injectable()
export class TaskService {
  noteTaskAndAssignToMember(
    description: Description,
    member: Member,
  ): Result<Task> {
    return Task.note(description, member.ownerId, member.assigneeId);
  }
}
