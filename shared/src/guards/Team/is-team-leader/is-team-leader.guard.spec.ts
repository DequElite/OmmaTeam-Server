import { IsTeamLeaderGuard } from './is-team-leader.guard';

describe('IsTeamLeaderGuard', () => {
  it('should be defined', () => {
    expect(new IsTeamLeaderGuard()).toBeDefined();
  });
});
