import { Request } from 'express';
import { Team, Teammate, User } from 'generated/prisma';

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
