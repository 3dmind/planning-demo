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
import { AppErrors } from '../../../shared/core';
import { GetUser } from '../../users/decorators/get-user.decorator';
import { UserId } from '../../users/domain/user-id.entity';
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
    @GetUser('userId') userId: UserId,
    @Query('taskId') taskId: string,
    @Body() dto: CommentOnTaskDto,
  ): Promise<void> {
    const result = await this.commentOnTaskUseCase.execute({
      dto,
      taskId,
      userId,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (Reflect.getPrototypeOf(error).constructor) {
        case CommentOnTaskErrors.MemberNotFoundError:
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
