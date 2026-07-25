import { describe, it } from 'node:test';
import assert from 'node:assert';
import { balanceTeams } from './teamGenerator.js';

const mk = (name, skill, role = 'all-rounder') => ({
  id: name,
  name,
  skill,
  role,
});

describe('balanceTeams', () => {
  it('throws when fewer than 4 players', () => {
    assert.throws(() => balanceTeams([mk('a', 3), mk('b', 3)]), /at least 4/);
  });

  it('splits players into two teams of equal size', () => {
    const players = [
      mk('a', 5),
      mk('b', 4),
      mk('c', 3),
      mk('d', 2),
      mk('e', 5),
      mk('f', 1),
    ];
    const { team1, team2 } = balanceTeams(players);
    assert.equal(team1.length + team2.length, 6);
    assert.ok(Math.abs(team1.length - team2.length) <= 1);
  });

  it('distributes wicket keepers across teams', () => {
    const players = [
      mk('wk1', 3, 'wicket-keeper'),
      mk('wk2', 3, 'wicket-keeper'),
      mk('a', 4),
      mk('b', 4),
    ];
    const { team1, team2 } = balanceTeams(players);
    const wk1 = team1.filter((p) => p.role === 'wicket-keeper').length;
    const wk2 = team2.filter((p) => p.role === 'wicket-keeper').length;
    assert.equal(wk1 + wk2, 2);
    assert.ok(wk1 <= 1 && wk2 <= 1);
  });
});
