import { Team, Teammate, User } from "generated/prisma";

export type CachedTeam = Team & {
  teammates: (Teammate & { user: User | null })[];
};
