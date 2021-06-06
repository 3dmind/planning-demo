import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Query,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from '../../../decorators/user-entity.decorator';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { GetMemberEntityByUserIdPipe } from '../../../pipes/get-member-entity-by-user-id.pipe';
import { GetTaskEntityByIdPipe } from '../../../pipes/get-task-entity-by-id.pipe';
import { AppErrors } from '../../../shared/core';
import { Member } from '../domain/member.entity';
import { Task } from '../domain/task.entity';
import { CommentOnTaskDto } from '../use-cases/comments/comment-on-task/comment-on-task.dto';
import { CommentOnTaskErrors } from '../use-cases/comments/comment-on-task/comment-on-task.errors';
import { CommentOnTaskUseCase } from '../use-cases/comments/comment-on-task/comment-on-task.use-case';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentOnTaskUseCase: CommentOnTaskUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async commentOnTask(
    @UserEntity('userId', GetMemberEntityByUserIdPipe) member: Member,
    @Query('taskId', GetTaskEntityByIdPipe) task: Task,
    @Body() dto: CommentOnTaskDto,
  ): Promise<void> {
    const result = await this.commentOnTaskUseCase.execute({
      dto,
      member,
      task,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (Reflect.getPrototypeOf(error).constructor) {
        case CommentOnTaskErrors.MemberIsNeitherTaskOwnerNorAssigneeError:
          throw new ForbiddenException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }
}
