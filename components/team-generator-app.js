'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import PlayerForm from '@/components/player-form';
import PlayerList from '@/components/player-list';
import TeamResults from '@/components/team-results';
import { createSamplePlayers } from '@/lib/sample-players';
import { generateTeams, movePlayerBetweenTeams } from '@/lib/team-generator';
import { isValidSkillLevel } from '@/lib/skill-levels';

const PLAYERS_STORAGE_KEY = 'volleyball-team-shake.players';

const initialDraftPlayer = {
    name: '',
    skill: 'normal',
    role: 'normal',
};

function createPlayerFromDraft(draftPlayer) {
    return {
        id: crypto.randomUUID(),
        name: draftPlayer.name.trim(),
        skill: draftPlayer.skill,
        role: draftPlayer.role,
        enabled: true,
    };
}

export default function TeamGeneratorApp() {
    const [players, setPlayers] = useState(() => createSamplePlayers());
    const [draftPlayer, setDraftPlayer] = useState(initialDraftPlayer);
    const [teamCount, setTeamCount] = useState(2);
    const [error, setError] = useState('');
    const [result, setResult] = useState({ teams: [], scoreSpread: 0 });
    const outputRef = useRef(null);

    useEffect(() => {
        try {
            const rawPlayers = window.localStorage.getItem(PLAYERS_STORAGE_KEY);

            if (!rawPlayers) {
                return;
            }

            const parsedPlayers = JSON.parse(rawPlayers);

            if (!Array.isArray(parsedPlayers)) {
                return;
            }

            const normalizedPlayers = parsedPlayers
                .filter((player) => (
                    player
                    && typeof player.name === 'string'
                    && player.name.trim()
                    && isValidSkillLevel(player.skill)
                    && (player.role === 'normal' || player.role === 'setter' || player.role === 'attacker')
                ))
                .map((player) => ({
                    id: typeof player.id === 'string' && player.id ? player.id : crypto.randomUUID(),
                    name: player.name.trim(),
                    skill: player.skill,
                    role: player.role,
                    enabled: player.enabled !== false,
                }));

            if (normalizedPlayers.length) {
                setPlayers(normalizedPlayers);
            }
        } catch {
            // Ignore invalid local storage data.
        }
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
        } catch {
            // Ignore storage write failures.
        }
    }, [players]);

    function handleAddPlayer() {
        const candidatePlayer = createPlayerFromDraft(draftPlayer);

        if (!candidatePlayer.name) {
            setError('Player name is required.');
            return;
        }

        if (!isValidSkillLevel(candidatePlayer.skill)) {
            setError('Skill must be Beginner, Normal, Good, or Master.');
            return;
        }

        setPlayers((currentPlayers) => [...currentPlayers, candidatePlayer]);
        setDraftPlayer(initialDraftPlayer);
        setError('');
    }

    function handleRemovePlayer(playerId) {
        setPlayers((currentPlayers) => currentPlayers.filter((player) => player.id !== playerId));
    }

    function handleUpdatePlayerSkill(playerId, nextSkill) {
        if (!isValidSkillLevel(nextSkill)) {
            return;
        }

        setPlayers((currentPlayers) => currentPlayers.map((player) => (
            player.id === playerId ? { ...player, skill: nextSkill } : player
        )));
    }

    function handleUpdatePlayerRole(playerId, nextRole) {
        if (!['normal', 'setter', 'attacker'].includes(nextRole)) {
            return;
        }

        setPlayers((currentPlayers) => currentPlayers.map((player) => (
            player.id === playerId ? { ...player, role: nextRole } : player
        )));
    }

    function handleTogglePlayerEnabled(playerId) {
        setPlayers((currentPlayers) => currentPlayers.map((player) => (
            player.id === playerId ? { ...player, enabled: player.enabled === false } : player
        )));
    }

    function handleGenerate() {
        const activePlayers = players.filter((player) => player.enabled !== false);
        const nextResult = generateTeams(activePlayers, teamCount);

        if (nextResult.error) {
            setError(nextResult.error);
            setResult({ teams: [], scoreSpread: 0 });
            return;
        }

        setError('');
        setResult(nextResult);

        requestAnimationFrame(() => {
            outputRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    }

    function handleReshuffle() {
        handleGenerate();
    }

    function handleManualMove(payload) {
        setResult((currentResult) => {
            if (!currentResult.teams.length) {
                return currentResult;
            }

            return movePlayerBetweenTeams(
                currentResult.teams,
                payload.fromTeamId,
                payload.toTeamId,
                payload.playerId,
                payload.targetPlayerId,
                payload.targetPositionNumber,
            );
        });
    }

    function handleLoadSample() {
        setPlayers(createSamplePlayers());
        setError('');
        setResult({ teams: [], scoreSpread: 0 });
    }

    const setterCount = players.filter((player) => player.role === 'setter').length;
    const activePlayersCount = players.filter((player) => player.enabled !== false).length;

    return (
        <main className="page-shell min-h-screen px-4 py-8 md:px-8 md:py-10 xl:px-10">
            <div className="mx-auto max-w-7xl">
                <section className="court-header stagger-in rounded-[2.25rem] px-4 py-4 md:px-6 md:py-5">
                    <div className="court-header-surface rounded-[1.75rem] p-4 md:p-6">
                        <div className="court-header-net" aria-hidden="true" />
                        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                            <div className="score-panel rounded-[1.5rem] p-4 text-white">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/65">Match mode</p>
                                <div className="mt-2 flex items-center gap-3">
                                    <Image
                                        src="/volleyball-logo.png"
                                        alt="Volleyball logo"
                                        width={46}
                                        height={46}
                                        className="h-11 w-11 rounded-full bg-white/92 p-1"
                                        priority
                                    />
                                    <h1 className="headline-font text-3xl font-bold md:text-4xl">Volleyball Team Shake</h1>
                                </div>
                            </div>

                            <div className="scoreboard-core rounded-[1.5rem] px-5 py-4 text-center text-white">
                                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/62">Players</p>
                                <div className="mt-2 flex items-center justify-center">
                                    <span className="score-disc score-disc-accent">{players.length}</span>
                                </div>
                                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
                                    Total roster
                                </div>
                            </div>

                            <div className="court-info-grid grid gap-3 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                                <div className="info-badge-card rounded-[1.35rem] px-4 py-3">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/58">Teams</p>
                                    <p className="headline-font mt-1 text-2xl font-bold text-white">{teamCount}</p>
                                </div>
                                <div className="info-badge-card rounded-[1.35rem] px-4 py-3">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/58">Active</p>
                                    <p className="headline-font mt-1 text-2xl font-bold text-white">{activePlayersCount}</p>
                                </div>
                                <div className="info-badge-card rounded-[1.35rem] px-4 py-3">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/58">Setters</p>
                                    <p className="headline-font mt-1 text-2xl font-bold text-white">{setterCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div ref={outputRef} className="mt-8">
                    <TeamResults
                        teams={result.teams}
                        scoreSpread={result.scoreSpread}
                        hasTeams={result.teams.length > 0}
                        onReshuffle={handleReshuffle}
                        onManualMove={handleManualMove}
                    />
                </div>

                <div className="mx-auto mt-6 max-w-5xl space-y-6">
                    <PlayerForm
                        draftPlayer={draftPlayer}
                        onDraftChange={setDraftPlayer}
                        onAddPlayer={handleAddPlayer}
                        onLoadSample={handleLoadSample}
                    />
                    <PlayerList
                        players={players}
                        teamCount={teamCount}
                        onTeamCountChange={setTeamCount}
                        onUpdatePlayerSkill={handleUpdatePlayerSkill}
                        onUpdatePlayerRole={handleUpdatePlayerRole}
                        onTogglePlayerEnabled={handleTogglePlayerEnabled}
                        onRemovePlayer={handleRemovePlayer}
                        onGenerate={handleGenerate}
                        error={error}
                    />
                </div>
            </div>
        </main>
    );
}