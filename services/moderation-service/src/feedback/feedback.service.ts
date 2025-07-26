import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'omma-shared-lib';
import { CreateFeedbackServiceDto } from './dto/feedback.dto';
import { FeedbackRates } from 'omma-shared-lib/generated/prisma';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  public async getPositiveFeedbacks() {
    const feedbacks = await this.prisma.feedback.findMany({
      where: {
        OR: [
          { rate: FeedbackRates.EXCELLENT },
          { rate: FeedbackRates.AVERAGE },
        ],
      },
    });

    return {
      feedbacks,
      message: 'Access granted',
    };
  }

  public async createFeedback(body: CreateFeedbackServiceDto) {
    const user = await this.checkIfUserExists(body.userEmail);
    if (!user) {
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        rate: body.rate,
        desc: body.desc,
        userId: user.id,
      },
    });

    return {
      feedback,
      message: 'Created success',
    };
  }

  private async checkIfUserExists(userEmail: string) {
    return await this.prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
  }
}
