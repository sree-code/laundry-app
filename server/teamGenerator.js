const ROLES = ['wicket-keeper', 'batsman', 'bowler', 'all-rounder'];

function balanceTeams(members) {
  if (members.length < 4) {
    throw new Error('Need at least 4 available players to form two teams');
  }

  const sorted = [...members].sort((a, b) => b.skill - a.skill);
  const team1 = [];
  const team2 = [];

  const wk = sorted.filter((m) => m.role === 'wicket-keeper');
  const rest = sorted.filter((m) => m.role !== 'wicket-keeper');

  wk.forEach((member, i) => {
    (i % 2 === 0 ? team1 : team2).push(member);
  });

  rest.forEach((member, i) => {
    const cycle = Math.floor(i / 2);
    const goesToTeam1 = cycle % 2 === 0 ? i % 2 === 0 : i % 2 === 1;
    (goesToTeam1 ? team1 : team2).push(member);
  });

  const rebalanceIfNeeded = () => {
    const diff = team1.length - team2.length;
    if (Math.abs(diff) <= 1) return;

    const [bigger, smaller] = diff > 0 ? [team1, team2] : [team2, team1];
    const moved = bigger.pop();
    if (moved) smaller.push(moved);
  };

  rebalanceIfNeeded();

  return { team1, team2 };
}

export { balanceTeams, ROLES };
