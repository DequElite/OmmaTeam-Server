import { Team, Teammate, User } from 'omma-shared-lib/generated/prisma';

export type CachedTeam = Team & {
  teammates: (Teammate & { user: User | null })[];
};
