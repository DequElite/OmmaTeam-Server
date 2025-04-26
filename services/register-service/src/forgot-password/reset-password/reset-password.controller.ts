import { Controller } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';

@Controller('forgot-password/reset-password')
export class ResetPasswordController {
	constructor(private readonly resetPasswordService: ResetPasswordService) {}
}
