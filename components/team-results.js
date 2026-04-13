'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import PlayerAvatar from '@/components/player-avatar';
import { getSkillLabel, getSkillScore } from '@/lib/skill-levels';

const COURT_POSITION_ROWS = [
    [5, 4],
    [6, 3],
    [1, 2],
];

const COURT_POSITION_ROWS_MIRROR = [
    [2, 1],
    [3, 6],
    [4, 5],
];

const MOBILE_POSITION_ROWS = [
    [1, 2],
    [3, 4],
    [5, 6],
];

const POSITION_META = {
    1: { name: 'Back Right', lane: 'Back', duty: 'Setter' },
    2: { name: 'Front Right', lane: 'Front', duty: 'Opposite Hitter' },
    3: { name: 'Front Middle', lane: 'Front', duty: 'Middle Blocker' },
    4: { name: 'Front Left', lane: 'Front', duty: 'Outside Hitter' },
    5: { name: 'Back Left', lane: 'Back', duty: 'Outside Hitter' },
    6: { name: 'Back Middle', lane: 'Back', duty: 'Libero' },
};

const COURT_POSITION_ORDER = [2, 4, 3, 6, 1, 5];

function assignPlayersToPositions(teamPlayers) {
    const positionMap = {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
    };

    COURT_POSITION_ORDER.forEach((positionNumber, index) => {
        positionMap[positionNumber] = teamPlayers[index] ?? null;
    });

    return {
        playerByPosition: positionMap,
        benchPlayers: teamPlayers.slice(COURT_POSITION_ORDER.length),
    };
}

function VolleyballIcon({ className = 'h-5 w-5' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 3a8.5 8.5 0 0 1 4.6 7.2M5.4 9.8A8.5 8.5 0 0 0 12 21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M7 5.6c3 1.4 5 4.2 5.3 7.5M17.6 14.8c-3-.1-5.8 1.2-7.8 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M18.7 7.1c-2.7.7-5 2.5-6.3 4.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
}

function getRoleLabel(role) {
    if (role === 'setter') {
        return 'Setter';
    }

    if (role === 'attacker') {
        return 'Attacker';
    }

    return 'Player';
}

function RoleBadge({ role }) {
    const isSetter = role === 'setter';
    const isAttacker = role === 'attacker';

    const roleClasses = isSetter
        ? 'bg-(--setter-soft) text-(--setter)'
        : isAttacker
            ? 'bg-orange-100 text-orange-700'
            : 'bg-slate-100 text-slate-600';

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${roleClasses}`}
        >
            {role}
        </span>
    );
}

function PlayerMiniCard({
    player,
    positionNumber,
    teamVariant,
    compact = false,
    className = '',
    isDropTarget,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
}) {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`team-player-mini-card flex cursor-grab items-center justify-between gap-2 rounded-2xl px-2.5 py-2 transition active:cursor-grabbing ${player.role === 'setter' ? 'team-player-card-setter' : ''} ${isDropTarget ? 'team-player-card-target' : ''} ${compact ? 'team-player-mini-card-compact' : ''} ${className}`}
        >
            <div className="flex min-w-0 items-start gap-2">
                <PlayerAvatar playerName={player.name} seedOffset={0} variant={teamVariant} className="h-9 w-9" />

                <div className="min-w-0">
                    <p className="headline-font wrap-break-word text-sm font-bold leading-tight">{player.name}</p>
                    <p className="mt-0.5 text-xs text-(--muted)">
                        Skill: {getSkillLabel(player.skill)}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="lineup-chip rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-(--foreground)">
                    Pow {getSkillScore(player.skill)}
                </span>
                <RoleBadge role={player.role} />
            </div>
        </div>
    );
}

function PositionSlot({
    teamId,
    teamVariant,
    positionNumber,
    player,
    isDropTarget,
    onPlayerDragStart,
    onDragEnd,
    onAllowDrop,
    onDrop,
}) {
    const positionMeta = POSITION_META[positionNumber];

    return (
        <div
            className={`court-position-slot rounded-2xl p-2 ${isDropTarget ? 'team-card-drop' : ''}`}
            onDragOver={(event) => onAllowDrop(event, teamId, player?.id ?? null, positionNumber)}
            onDrop={(event) => onDrop(event, teamId, player?.id ?? null, positionNumber)}
        >
            <div className="mb-1.5 flex items-center justify-between">
                <span className="court-position-label rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                    Pos {positionNumber}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58">{positionMeta.lane}</span>
            </div>

            <p className="mb-2 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/62" title={positionMeta.name}>
                {positionMeta.name}
            </p>

            <div className="court-slot-body">
                {player ? (
                    <PlayerMiniCard
                        player={player}
                        positionNumber={positionNumber}
                        teamVariant={teamVariant}
                        compact
                        className="h-full"
                        isDropTarget={isDropTarget}
                        onDragStart={(event) => onPlayerDragStart(event, teamId, player.id)}
                        onDragEnd={onDragEnd}
                        onDragOver={(event) => onAllowDrop(event, teamId, player.id, positionNumber)}
                        onDrop={(event) => onDrop(event, teamId, player.id, positionNumber)}
                    />
                ) : (
                    <div className="court-slot-empty rounded-xl border border-dashed border-white/25 px-2 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                        Empty
                    </div>
                )}
            </div>
        </div>
    );
}

function TeamLineupCard({
    team,
    teamVariant,
    playerByPosition,
    benchPlayers,
    isDropTarget,
    onAllowDrop,
    onDrop,
    onPlayerDragStart,
    onDragEnd,
}) {
    return (
        <article
            className={`team-card rounded-[1.75rem] p-5 transition ${isDropTarget(team.id, null) ? 'team-card-drop' : ''}`}
            onDragOver={(event) => onAllowDrop(event, team.id)}
            onDrop={(event) => onDrop(event, team.id)}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="headline-font flex items-center gap-2 text-xl font-bold">
                        <VolleyballIcon className="h-5 w-5 text-(--accent-strong)" />
                        Team {team.id}
                    </h3>
                    <p className="mt-1 text-sm text-(--muted)">
                        Setter centered, attackers on side lanes, {benchPlayers.length} bench
                    </p>
                </div>
                <div className="team-banner rounded-2xl px-4 py-3 text-right text-white sm:min-w-32">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">Total power</p>
                    <p className="headline-font text-2xl font-bold">{team.totalSkill}</p>
                </div>
            </div>

            <div className="mt-5 space-y-2">
                {MOBILE_POSITION_ROWS.map((row) => (
                    <div key={row.join('-')} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {row.map((positionNumber) => (
                            <div
                                key={positionNumber}
                                className={`rounded-2xl border border-(--line) bg-white/75 p-2 ${isDropTarget(team.id, playerByPosition[positionNumber]?.id ?? null) ? 'team-card-drop' : ''}`}
                                onDragOver={(event) => onAllowDrop(event, team.id, playerByPosition[positionNumber]?.id ?? null, positionNumber)}
                                onDrop={(event) => onDrop(event, team.id, playerByPosition[positionNumber]?.id ?? null, positionNumber)}
                            >
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)">Pos {positionNumber}</p>
                                {playerByPosition[positionNumber] ? (
                                    <PlayerMiniCard
                                        player={playerByPosition[positionNumber]}
                                        positionNumber={positionNumber}
                                        teamVariant={teamVariant}
                                        compact
                                        isDropTarget={isDropTarget(team.id, playerByPosition[positionNumber].id)}
                                        onDragStart={(event) => onPlayerDragStart(event, team.id, playerByPosition[positionNumber].id)}
                                        onDragEnd={onDragEnd}
                                        onDragOver={(event) => onAllowDrop(event, team.id, playerByPosition[positionNumber].id, positionNumber)}
                                        onDrop={(event) => onDrop(event, team.id, playerByPosition[positionNumber].id, positionNumber)}
                                    />
                                ) : (
                                    <div className="rounded-xl border border-dashed border-(--line) px-2 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-(--muted)">
                                        Empty
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-4 rounded-2xl border border-(--line) bg-white/74 p-3">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-(--muted)">Bench</p>
                    <span className="rounded-full border border-(--line) bg-white px-2 py-0.5 text-[11px] font-semibold text-(--foreground)">
                        {benchPlayers.length}
                    </span>
                </div>
                {benchPlayers.length ? (
                    <div className="space-y-2">
                        {benchPlayers.map((player) => (
                            <PlayerMiniCard
                                key={player.id}
                                player={player}
                                teamVariant={teamVariant}
                                isDropTarget={isDropTarget(team.id, player.id)}
                                onDragStart={(event) => onPlayerDragStart(event, team.id, player.id)}
                                onDragEnd={onDragEnd}
                                onDragOver={(event) => onAllowDrop(event, team.id, player.id)}
                                onDrop={(event) => onDrop(event, team.id, player.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-(--line) px-3 py-3 text-center text-xs uppercase tracking-[0.14em] text-(--muted)">
                        No bench players
                    </div>
                )}
            </div>
        </article>
    );
}

export default function TeamResults({ teams, scoreSpread, hasTeams, onReshuffle, onManualMove }) {
    const [dragState, setDragState] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const captureRef = useRef(null);

    function handlePlayerDragStart(event, teamId, playerId) {
        const payload = JSON.stringify({ teamId, playerId });

        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/json', payload);
        setDragState({ fromTeamId: teamId, playerId, overTeamId: teamId, overPlayerId: null });
    }

    function handleDragEnd() {
        setDragState(null);
    }

    function allowDrop(event, overTeamId, overPlayerId = null, overPositionNumber = null) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        setDragState((current) => current ? {
            ...current,
            overTeamId,
            overPlayerId,
            overPositionNumber,
        } : current);
    }

    function handleDrop(event, toTeamId, targetPlayerId = null, targetPositionNumber = null) {
        event.preventDefault();
        event.stopPropagation();

        try {
            const payload = JSON.parse(event.dataTransfer.getData('application/json'));

            onManualMove({
                fromTeamId: payload.teamId,
                toTeamId,
                playerId: payload.playerId,
                targetPlayerId,
                targetPositionNumber,
            });
        } catch {
            // Ignore malformed drag payloads.
        }

        setDragState(null);
    }

    function isDropTarget(teamId, playerId = null) {
        return dragState?.overTeamId === teamId && dragState?.overPlayerId === playerId;
    }

    async function handleCapture() {
        if (!captureRef.current || !hasTeams || isCapturing) {
            return;
        }

        try {
            setIsCapturing(true);

            const dataUrl = await toPng(captureRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#f7f3ea',
            });

            const downloadLink = document.createElement('a');
            downloadLink.download = `volleyball-teams-${new Date().toISOString().slice(0, 10)}.png`;
            downloadLink.href = dataUrl;
            downloadLink.click();
        } catch (error) {
            console.error('Failed to capture teams', error);
        } finally {
            setIsCapturing(false);
        }
    }

    const shouldUseCourtLayout = teams.length === 2;

    return (
        <section className="glass-panel stagger-in rounded-4xl p-6 md:p-7" data-delay="3">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="section-kicker text-xs font-semibold uppercase tracking-[0.24em] text-(--accent-strong)">
                        Output
                    </p>
                    <h2 className="headline-font mt-2 text-2xl font-bold">Balanced teams with setter coverage</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCapture}
                        disabled={!hasTeams || isCapturing}
                        className="rounded-full border border-(--line) bg-white/70 px-4 py-2 text-sm font-semibold text-(--foreground) transition enabled:hover:-translate-y-0.5 enabled:hover:border-(--accent) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isCapturing ? 'Capturing...' : 'Capture PNG'}
                    </button>
                    <button
                        type="button"
                        onClick={onReshuffle}
                        disabled={!hasTeams}
                        className="rounded-full border border-(--line) bg-white/70 px-4 py-2 text-sm font-semibold text-(--foreground) transition enabled:hover:-translate-y-0.5 enabled:hover:border-(--accent) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Reshuffle
                    </button>
                </div>
            </div>

            {!hasTeams ? (
                <div className="mt-6 rounded-3xl border border-dashed border-(--line) px-5 py-12 text-center text-(--muted)">
                    Teams will appear here after you shuffle the roster.
                </div>
            ) : (
                <div ref={captureRef} className="mt-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-(--muted)">
                        <span className="metal-pill rounded-full px-3 py-2 font-semibold text-(--foreground)">
                            <span className="inline-flex items-center gap-2">
                                <VolleyballIcon className="h-4 w-4" />
                                Score spread: {scoreSpread}
                            </span>
                        </span>
                        <span>Lower spread means more balanced teams.</span>
                    </div>

                    {shouldUseCourtLayout ? (
                        (() => {
                            const leftTeam = teams[0];
                            const rightTeam = teams[1];
                            const leftVariant = 'home';
                            const rightVariant = 'away';
                            const { playerByPosition: leftPositions, benchPlayers: leftBenchPlayers } = assignPlayersToPositions(leftTeam.players);
                            const { playerByPosition: rightPositions, benchPlayers: rightBenchPlayers } = assignPlayersToPositions(rightTeam.players);

                            return (
                                <>
                                    <div className="mt-6 hidden gap-3 md:grid md:grid-cols-2">
                                        <article className="rounded-3xl border border-(--line) bg-white/82 p-4">
                                            <h3 className="headline-font text-xl font-bold">Team {leftTeam.id}</h3>
                                            <p className="mt-1 text-sm text-(--muted)">
                                                {leftTeam.players.length} players, total power {leftTeam.totalSkill}
                                            </p>
                                        </article>
                                        <article className="rounded-3xl border border-(--line) bg-white/82 p-4">
                                            <h3 className="headline-font text-xl font-bold">Team {rightTeam.id}</h3>
                                            <p className="mt-1 text-sm text-(--muted)">
                                                {rightTeam.players.length} players, total power {rightTeam.totalSkill}
                                            </p>
                                        </article>
                                    </div>

                                    <div className="mt-4 grid gap-4 md:hidden">
                                        <TeamLineupCard
                                            team={leftTeam}
                                            teamVariant={leftVariant}
                                            playerByPosition={leftPositions}
                                            benchPlayers={leftBenchPlayers}
                                            isDropTarget={isDropTarget}
                                            onAllowDrop={allowDrop}
                                            onDrop={handleDrop}
                                            onPlayerDragStart={handlePlayerDragStart}
                                            onDragEnd={handleDragEnd}
                                        />
                                        <TeamLineupCard
                                            team={rightTeam}
                                            teamVariant={rightVariant}
                                            playerByPosition={rightPositions}
                                            benchPlayers={rightBenchPlayers}
                                            isDropTarget={isDropTarget}
                                            onAllowDrop={allowDrop}
                                            onDrop={handleDrop}
                                            onPlayerDragStart={handlePlayerDragStart}
                                            onDragEnd={handleDragEnd}
                                        />
                                    </div>

                                    <div className="hidden md:block">
                                        <div className="court-stage mt-4 overflow-hidden rounded-4xl p-3 md:p-5">
                                            <div className="court-surface rounded-[1.75rem] p-4 md:p-5">
                                                <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                                                    <p className="headline-font text-sm font-bold uppercase tracking-[0.2em] text-white">Team {leftTeam.id}</p>
                                                    <span className="text-white/60">|</span>
                                                    <p className="headline-font text-sm font-bold uppercase tracking-[0.2em] text-white">Team {rightTeam.id}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    {COURT_POSITION_ROWS.map((leftRow, rowIndex) => {
                                                        const rightRow = COURT_POSITION_ROWS_MIRROR[rowIndex];

                                                        return (
                                                            <div key={leftRow.join('-')} className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {leftRow.map((positionNumber) => (
                                                                        <PositionSlot
                                                                            key={`left-${positionNumber}`}
                                                                            teamId={leftTeam.id}
                                                                            teamVariant={leftVariant}
                                                                            positionNumber={positionNumber}
                                                                            player={leftPositions[positionNumber]}
                                                                            isDropTarget={isDropTarget(leftTeam.id, leftPositions[positionNumber]?.id ?? null)}
                                                                            onPlayerDragStart={handlePlayerDragStart}
                                                                            onDragEnd={handleDragEnd}
                                                                            onAllowDrop={allowDrop}
                                                                            onDrop={handleDrop}
                                                                        />
                                                                    ))}
                                                                </div>

                                                                <div className="flex items-center justify-center text-lg font-bold text-white/55">|</div>

                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {rightRow.map((positionNumber) => (
                                                                        <PositionSlot
                                                                            key={`right-${positionNumber}`}
                                                                            teamId={rightTeam.id}
                                                                            teamVariant={rightVariant}
                                                                            positionNumber={positionNumber}
                                                                            player={rightPositions[positionNumber]}
                                                                            isDropTarget={isDropTarget(rightTeam.id, rightPositions[positionNumber]?.id ?? null)}
                                                                            onPlayerDragStart={handlePlayerDragStart}
                                                                            onDragEnd={handleDragEnd}
                                                                            onAllowDrop={allowDrop}
                                                                            onDrop={handleDrop}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bench-deck mt-4 grid gap-3 md:grid-cols-2">
                                            <article
                                                className={`rounded-3xl border border-(--line) bg-white/82 p-4 ${isDropTarget(leftTeam.id, null) ? 'team-card-drop' : ''}`}
                                                onDragOver={(event) => allowDrop(event, leftTeam.id)}
                                                onDrop={(event) => handleDrop(event, leftTeam.id)}
                                            >
                                                <div className="mb-3 flex items-center justify-between">
                                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-(--muted)">Team {leftTeam.id} Bench</p>
                                                    <span className="rounded-full border border-(--line) bg-white px-2 py-0.5 text-xs font-semibold text-(--foreground)">
                                                        {leftBenchPlayers.length}
                                                    </span>
                                                </div>
                                                {leftBenchPlayers.length ? (
                                                    <div className="space-y-2">
                                                        {leftBenchPlayers.map((player) => (
                                                            <PlayerMiniCard
                                                                key={player.id}
                                                                player={player}
                                                                teamVariant={leftVariant}
                                                                isDropTarget={isDropTarget(leftTeam.id, player.id)}
                                                                onDragStart={(event) => handlePlayerDragStart(event, leftTeam.id, player.id)}
                                                                onDragEnd={handleDragEnd}
                                                                onDragOver={(event) => allowDrop(event, leftTeam.id, player.id)}
                                                                onDrop={(event) => handleDrop(event, leftTeam.id, player.id)}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-(--line) px-3 py-3 text-center text-xs uppercase tracking-[0.14em] text-(--muted)">
                                                        No bench players
                                                    </div>
                                                )}
                                            </article>

                                            <article
                                                className={`rounded-3xl border border-(--line) bg-white/82 p-4 ${isDropTarget(rightTeam.id, null) ? 'team-card-drop' : ''}`}
                                                onDragOver={(event) => allowDrop(event, rightTeam.id)}
                                                onDrop={(event) => handleDrop(event, rightTeam.id)}
                                            >
                                                <div className="mb-3 flex items-center justify-between">
                                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-(--muted)">Team {rightTeam.id} Bench</p>
                                                    <span className="rounded-full border border-(--line) bg-white px-2 py-0.5 text-xs font-semibold text-(--foreground)">
                                                        {rightBenchPlayers.length}
                                                    </span>
                                                </div>
                                                {rightBenchPlayers.length ? (
                                                    <div className="space-y-2">
                                                        {rightBenchPlayers.map((player) => (
                                                            <PlayerMiniCard
                                                                key={player.id}
                                                                player={player}
                                                                teamVariant={rightVariant}
                                                                isDropTarget={isDropTarget(rightTeam.id, player.id)}
                                                                onDragStart={(event) => handlePlayerDragStart(event, rightTeam.id, player.id)}
                                                                onDragEnd={handleDragEnd}
                                                                onDragOver={(event) => allowDrop(event, rightTeam.id, player.id)}
                                                                onDrop={(event) => handleDrop(event, rightTeam.id, player.id)}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-(--line) px-3 py-3 text-center text-xs uppercase tracking-[0.14em] text-(--muted)">
                                                        No bench players
                                                    </div>
                                                )}
                                            </article>
                                        </div>
                                    </div>
                                </>
                            );
                        })()
                    ) : (
                        <div className="mt-6 grid gap-4 xl:grid-cols-2">
                            {teams.map((team, index) => {
                                const teamVariant = index % 2 === 0 ? 'home' : 'away';
                                const { playerByPosition, benchPlayers } = assignPlayersToPositions(team.players);

                                return (
                                    <TeamLineupCard
                                        key={team.id}
                                        team={team}
                                        teamVariant={teamVariant}
                                        playerByPosition={playerByPosition}
                                        benchPlayers={benchPlayers}
                                        isDropTarget={isDropTarget}
                                        onAllowDrop={allowDrop}
                                        onDrop={handleDrop}
                                        onPlayerDragStart={handlePlayerDragStart}
                                        onDragEnd={handleDragEnd}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}