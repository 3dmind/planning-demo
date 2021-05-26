import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { GetMemberEntityByUserIdPipe } from '../../../pipes/get-member-entity-by-user-id.pipe';
import { AppErrors } from '../../../shared/core';
import { GetUser } from '../../users/decorators/get-user.decorator';
import { Member } from '../domain/member.entity';
import { CommentOnTaskDto } from '../use-cases/comments/comment-on-task/comment-on-task.dto';
import { CommentOnTaskErrors } from '../use-cases/comments/comment-on-task/comment-on-task.errors';
import { CommentOnTaskUsecase } from '../use-cases/comments/comment-on-task/comment-on-task.usecase';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentOnTaskUseCase: CommentOnTaskUsecase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async commentOnTask(
    @GetUser('userId', GetMemberEntityByUserIdPipe) member: Member,
    @Query('taskId') taskId: string,
    @Body() dto: CommentOnTaskDto,
  ): Promise<void> {
    const result = await this.commentOnTaskUseCase.execute({
      dto,
      member,
      taskId,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (Reflect.getPrototypeOf(error).constructor) {
        case CommentOnTaskErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
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
