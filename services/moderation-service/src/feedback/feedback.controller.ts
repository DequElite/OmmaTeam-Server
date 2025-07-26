import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtauthGuard } from 'omma-shared-lib';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtauthGuard)
  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  async createFeedback(@Body() body: CreateFeedbackDto, @Req() req: Request) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const user = req['user'];
      if (!user) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.BAD_REQUEST);
      }

      const { message, feedback } = await this.feedbackService.createFeedback({
        ...body,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        userEmail: user.email,
      });

      return {
        message,
        feedback,
      };
    } catch (err) {
      console.error('Error during creating feedback:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  @Get('/positive')
  @HttpCode(HttpStatus.OK)
  async getPositiveFeedbacks() {
    try {
      const { message, feedbacks } =
        await this.feedbackService.getPositiveFeedbacks();

      return {
        message,
        feedbacks,
      };
    } catch (err) {
      console.error(' An error occurred while retrieving feedback: ', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }
}
