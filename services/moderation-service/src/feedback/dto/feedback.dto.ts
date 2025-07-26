import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { FeedbackRates } from 'omma-shared-lib/generated/prisma';

export class CreateFeedbackDto {
  @ApiProperty({
    enum: FeedbackRates,
    example: FeedbackRates.EXCELLENT,
    description: 'Type of the task (DEFAULT or SUBTASKS)',
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEnum(FeedbackRates, { message: 'rate must be a FeedbackRates' })
  rate: keyof typeof FeedbackRates;

  @ApiProperty({
    example: 'User cannot login due to server error.',
    description: 'Description of the task',
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString({ message: 'description must be a string' })
  desc: string;
}

export class CreateFeedbackServiceDto extends CreateFeedbackDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email of the user checking the subtask',
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEmail()
  userEmail: string;
}
