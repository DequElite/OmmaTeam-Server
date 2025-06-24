import { Team, Teammate, User } from 'omma-shared-lib/generated/prisma';
import { Request } from 'express';

export interface IRequestWithTeam extends Request {
  team?: Team & {
    teammates: (Teammate & {
      user: User;
    })[];
  };
}

export interface IRequestWithUser extends Request {
  user?: User;
}
