import { getSkillScore, isValidSkillLevel } from './skill-levels';

const COURT_POSITION_ORDER = [2, 4, 3, 6, 1, 5];

function randomizeTieBreak() {
    return Math.random() - 0.5;
}

function createTeams(teamCount) {
    return Array.from({ length: teamCount }, (_, index) => ({
        id: index + 1,
        players: [],
        totalSkill: 0,
        setterCount: 0,
        attackerCount: 0,
    }));
}

function sortByStrength(players) {
    return [...players].sort((left, right) => {
        const scoreDiff = getSkillScore(right.skill) - getSkillScore(left.skill);

        if (scoreDiff !== 0) {
            return scoreDiff;
        }

        return randomizeTieBreak();
    });
}

function getWeakestTeamIndex(teams) {
    return teams.reduce((bestIndex, team, index, source) => {
        const currentBest = source[bestIndex];

        if (team.totalSkill < currentBest.totalSkill) {
            return index;
        }

        if (team.totalSkill === currentBest.totalSkill && team.players.length < currentBest.players.length) {
            return index;
        }

        return bestIndex;
    }, 0);
}

function getBestSetterTeamIndex(teams) {
    return teams.reduce((bestIndex, team, index, source) => {
        const currentBest = source[bestIndex];

        if (team.setterCount < currentBest.setterCount) {
            return index;
        }

        if (team.setterCount === currentBest.setterCount && team.totalSkill < currentBest.totalSkill) {
            return index;
        }

        return bestIndex;
    }, 0);
}

function getBestAttackerTeamIndex(teams) {
    return teams.reduce((bestIndex, team, index, source) => {
        const currentBest = source[bestIndex];

        if (team.attackerCount < currentBest.attackerCount) {
            return index;
        }

        if (team.attackerCount === currentBest.attackerCount && team.totalSkill < currentBest.totalSkill) {
            return index;
        }

        return bestIndex;
    }, 0);
}

function addPlayerToTeam(teams, teamIndex, player) {
    const team = teams[teamIndex];

    team.players.push(player);
    team.totalSkill += getSkillScore(player.skill);

    if (player.role === 'setter') {
        team.setterCount += 1;
    }

    if (player.role === 'attacker') {
        team.attackerCount += 1;
    }
}

function getScoreSpread(teams) {
    const scores = teams.map((team) => team.totalSkill);
    return Math.max(...scores) - Math.min(...scores);
}

function summarizeTeam(team) {
    const totalSkill = team.players.reduce((sum, player) => sum + getSkillScore(player.skill), 0);
    const setterCount = team.players.filter((player) => player.role === 'setter').length;
    const attackerCount = team.players.filter((player) => player.role === 'attacker').length;

    return {
        ...team,
        totalSkill,
        setterCount,
        attackerCount,
    };
}

    function takeFirstMatching(players, predicate) {
        const playerIndex = players.findIndex(predicate);

        if (playerIndex === -1) {
            return null;
        }

        const [player] = players.splice(playerIndex, 1);
        return player;
    }

    function arrangeTeamLineup(players) {
        const availablePlayers = [...players];
        const lineup = new Array(Math.min(players.length, 6)).fill(null);

        // COURT_POSITION_ORDER = [2, 4, 3, 6, 1, 5]
        // Index 0: Pos 2 (Front Right)
        // Index 1: Pos 4 (Front Left)
        // Index 2: Pos 3 (Front Middle)
        // Index 3: Pos 6 (Back Middle)
        // Index 4: Pos 1 (Back Right)
        // Index 5: Pos 5 (Back Left)

        // Setter to Front Middle (Index 2: Pos 3)
        if (lineup.length > 2) {
            lineup[2] = takeFirstMatching(availablePlayers, (player) => player.role === 'setter');
        }

        // Attackers to Front positions (Index 0: Pos 2, Index 1: Pos 4)
        if (lineup.length > 0) {
            lineup[0] = takeFirstMatching(availablePlayers, (player) => player.role === 'attacker') || availablePlayers.shift();
        }

        if (lineup.length > 1) {
            lineup[1] = takeFirstMatching(availablePlayers, (player) => player.role === 'attacker') || availablePlayers.shift();
        }

        // Fill remaining positions in order (Back Middle, then Back Sides)
        for (let index = 0; index < lineup.length; index += 1) {
            if (!lineup[index]) {
                lineup[index] = availablePlayers.shift() ?? null;
            }
        }

        return [...lineup.filter(Boolean), ...availablePlayers];
    }

    function arrangeTeamsLineups(teams) {
        return teams.map((team) => ({
            ...team,
            players: arrangeTeamLineup(team.players),
        }));
    }

export function recalculateTeams(teams) {
    const normalizedTeams = teams.map((team) => summarizeTeam({
        ...team,
        players: [...team.players],
    }));

    return {
        teams: normalizedTeams,
        scoreSpread: getScoreSpread(normalizedTeams),
    };
}

function cloneTeams(teams) {
    return teams.map((team) => ({
        ...team,
        players: [...team.players],
    }));
}

function getCourtSlotIndex(positionNumber) {
    return COURT_POSITION_ORDER.indexOf(positionNumber);
}

function swapPlayers(teams, firstTeamIndex, secondTeamIndex, firstPlayerIndex, secondPlayerIndex) {
    const nextTeams = cloneTeams(teams);
    const firstTeam = nextTeams[firstTeamIndex];
    const secondTeam = nextTeams[secondTeamIndex];
    const firstPlayer = firstTeam.players[firstPlayerIndex];
    const secondPlayer = secondTeam.players[secondPlayerIndex];

    firstTeam.players[firstPlayerIndex] = secondPlayer;
    secondTeam.players[secondPlayerIndex] = firstPlayer;

    firstTeam.totalSkill = firstTeam.totalSkill - getSkillScore(firstPlayer.skill) + getSkillScore(secondPlayer.skill);
    secondTeam.totalSkill = secondTeam.totalSkill - getSkillScore(secondPlayer.skill) + getSkillScore(firstPlayer.skill);

    firstTeam.setterCount = firstTeam.players.filter((player) => player.role === 'setter').length;
    secondTeam.setterCount = secondTeam.players.filter((player) => player.role === 'setter').length;
    firstTeam.attackerCount = firstTeam.players.filter((player) => player.role === 'attacker').length;
    secondTeam.attackerCount = secondTeam.players.filter((player) => player.role === 'attacker').length;

    return nextTeams;
}

function optimizeTeams(teams) {
    let bestTeams = cloneTeams(teams);
    let bestSpread = getScoreSpread(bestTeams);

    for (let firstTeamIndex = 0; firstTeamIndex < teams.length; firstTeamIndex += 1) {
        for (let secondTeamIndex = firstTeamIndex + 1; secondTeamIndex < teams.length; secondTeamIndex += 1) {
            const firstTeam = teams[firstTeamIndex];
            const secondTeam = teams[secondTeamIndex];

            for (let firstPlayerIndex = 0; firstPlayerIndex < firstTeam.players.length; firstPlayerIndex += 1) {
                for (let secondPlayerIndex = 0; secondPlayerIndex < secondTeam.players.length; secondPlayerIndex += 1) {
                    const firstPlayer = firstTeam.players[firstPlayerIndex];
                    const secondPlayer = secondTeam.players[secondPlayerIndex];

                    if (firstPlayer.role !== secondPlayer.role) {
                        continue;
                    }

                    const candidateTeams = swapPlayers(
                        teams,
                        firstTeamIndex,
                        secondTeamIndex,
                        firstPlayerIndex,
                        secondPlayerIndex,
                    );
                    const candidateSpread = getScoreSpread(candidateTeams);

                    if (candidateSpread < bestSpread) {
                        bestSpread = candidateSpread;
                        bestTeams = candidateTeams;
                    }
                }
            }
        }
    }

    return bestTeams;
}

export function validateSetup(players, teamCount) {
    if (!Array.isArray(players) || players.length === 0) {
        return 'Add at least one player before generating teams.';
    }

    if (!Number.isInteger(teamCount) || teamCount < 2) {
        return 'Choose at least 2 teams.';
    }

    if (teamCount > players.length) {
        return 'Number of teams cannot exceed number of players.';
    }

    const hasInvalidSkill = players.some((player) => !isValidSkillLevel(player.skill));

    if (hasInvalidSkill) {
        return 'Every player must have a valid skill level.';
    }

    const hasEmptyName = players.some((player) => !player.name.trim());

    if (hasEmptyName) {
        return 'Every player must have a name.';
    }

    const validRoles = new Set(['setter', 'attacker', 'normal']);
    const hasInvalidRole = players.some((player) => !validRoles.has(player.role));

    if (hasInvalidRole) {
        return 'Role must be setter, attacker, or normal.';
    }

    return null;
}

export function generateTeams(players, teamCount, options = {}) {
    const validationError = validateSetup(players, teamCount);

    if (validationError) {
        return {
            error: validationError,
            teams: [],
            scoreSpread: 0,
        };
    }

    const setters = sortByStrength(players.filter((player) => player.role === 'setter'));
    const attackers = sortByStrength(players.filter((player) => player.role === 'attacker'));
    const normals = sortByStrength(players.filter((player) => player.role === 'normal'));
    const teams = createTeams(teamCount);

    setters.forEach((player) => {
        const teamIndex = getBestSetterTeamIndex(teams);
        addPlayerToTeam(teams, teamIndex, player);
    });

    attackers.forEach((player) => {
        const teamIndex = getBestAttackerTeamIndex(teams);
        addPlayerToTeam(teams, teamIndex, player);
    });

    normals.forEach((player) => {
        const teamIndex = getWeakestTeamIndex(teams);
        addPlayerToTeam(teams, teamIndex, player);
    });

    const optimizedTeams = options.optimize === false ? teams : optimizeTeams(teams);
    const finalizedTeams = arrangeTeamsLineups(optimizedTeams);

    return {
        error: null,
        teams: finalizedTeams,
        scoreSpread: getScoreSpread(finalizedTeams),
    };
}

export function movePlayerBetweenTeams(teams, fromTeamId, toTeamId, playerId, targetPlayerId = null, targetPositionNumber = null) {
    if (fromTeamId === toTeamId && !targetPlayerId) {
        return recalculateTeams(teams);
    }

    const nextTeams = cloneTeams(teams);
    const sourceTeam = nextTeams.find((team) => team.id === fromTeamId);
    const destinationTeam = nextTeams.find((team) => team.id === toTeamId);

    if (!sourceTeam || !destinationTeam) {
        return recalculateTeams(teams);
    }

    const playerIndex = sourceTeam.players.findIndex((player) => player.id === playerId);

    if (playerIndex === -1) {
        return recalculateTeams(teams);
    }

    const targetSlotIndex = targetPositionNumber == null ? -1 : getCourtSlotIndex(targetPositionNumber);

        if (targetPlayerId) {
            const targetIndex = destinationTeam.players.findIndex((teamPlayer) => teamPlayer.id === targetPlayerId);

            if (targetIndex === -1) {
            return recalculateTeams(teams);
        }

            if (fromTeamId === toTeamId) {
                if (targetIndex === playerIndex) {
                    return recalculateTeams(teams);
                }

                [sourceTeam.players[playerIndex], sourceTeam.players[targetIndex]] = [
                    sourceTeam.players[targetIndex],
                    sourceTeam.players[playerIndex],
                ];
                return recalculateTeams(nextTeams);
            }

            [sourceTeam.players[playerIndex], destinationTeam.players[targetIndex]] = [
                destinationTeam.players[targetIndex],
                sourceTeam.players[playerIndex],
            ];

        return recalculateTeams(nextTeams);
    }

    if (targetSlotIndex !== -1) {
        const [player] = sourceTeam.players.splice(playerIndex, 1);

        if (!player) {
            return recalculateTeams(teams);
        }

        if (fromTeamId === toTeamId) {
            sourceTeam.players.splice(targetSlotIndex, 0, player);

            const duplicateIndex = sourceTeam.players.findIndex((teamPlayer, index) => index !== targetSlotIndex && teamPlayer.id === player.id);

            if (duplicateIndex !== -1) {
                sourceTeam.players.splice(duplicateIndex, 1);
            }

            return recalculateTeams(nextTeams);
        }

        destinationTeam.players.splice(targetSlotIndex, 0, player);
        return recalculateTeams(nextTeams);
    }

    const [player] = sourceTeam.players.splice(playerIndex, 1);

    if (!player) {
        return recalculateTeams(teams);
    }

    let insertIndex = destinationTeam.players.length;

    if (targetPlayerId) {
        const targetIndex = destinationTeam.players.findIndex((teamPlayer) => teamPlayer.id === targetPlayerId);

        if (targetIndex !== -1) {
            insertIndex = targetIndex;
        }
    }

    if (fromTeamId === toTeamId && playerIndex < insertIndex) {
        insertIndex -= 1;
    }

    destinationTeam.players.splice(insertIndex, 0, player);

    return recalculateTeams(nextTeams);
}