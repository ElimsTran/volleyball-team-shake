'use client';

import PlayerAvatar from '@/components/player-avatar';
import { SKILL_LEVEL_OPTIONS, getSkillShort } from '@/lib/skill-levels';

function getLineupMarker(player, index) {
    const prefix = player.role === 'setter' ? 'S' : player.role === 'attacker' ? 'A' : 'L';
    return `${prefix}${index + 1}`;
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
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${roleClasses}`}
        >
            {role}
        </span>
    );
}

export default function PlayerList({ players, teamCount, onTeamCountChange, onUpdatePlayerSkill, onUpdatePlayerRole, onTogglePlayerEnabled, onRemovePlayer, onGenerate, error }) {
    const activePlayers = players.filter((player) => player.enabled !== false);

    return (
        <section className="glass-panel stagger-in rounded-4xl p-6 md:p-7" data-delay="2">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="section-kicker text-xs font-semibold uppercase tracking-[0.24em] text-(--accent-strong)">
                        Roster
                    </p>
                    <h2 className="headline-font mt-2 text-2xl font-bold">Review players before shuffling</h2>
                </div>

                <div className="flex items-end gap-3">
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-(--muted)">Teams</span>
                        <select
                            value={teamCount}
                            onChange={(event) => onTeamCountChange(Number(event.target.value))}
                            className="min-w-28 rounded-2xl border border-(--line) bg-white px-4 py-3 outline-none transition focus:border-(--accent)"
                        >
                            {Array.from({ length: 6 }, (_, index) => index + 2).map((value) => (
                                <option key={value} value={value}>
                                    {value} teams
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        onClick={onGenerate}
                        className="rounded-full bg-(--accent) px-5 py-3 font-semibold text-(--foreground) transition hover:-translate-y-0.5 hover:bg-(--accent-strong) hover:text-white"
                    >
                        Shuffle teams
                    </button>
                </div>
            </div>

            {error ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-(--danger)">
                    {error}
                </div>
            ) : null}

            <div className="mt-6 space-y-3">
                {players.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-(--line) px-5 py-10 text-center text-(--muted)">
                        Add players or load the sample roster to generate balanced teams.
                    </div>
                ) : (
                    players.map((player, index) => (
                        <div
                            key={player.id}
                            className={`player-card flex flex-wrap items-center justify-between gap-4 rounded-3xl px-4 py-4 ${player.role === 'setter' ? 'player-card-setter' : ''} ${player.enabled === false ? 'opacity-55 saturate-50' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <PlayerAvatar playerName={player.name} seedOffset={index} className="h-14 w-14" />

                                <div className="skill-orb shrink-0 text-center">
                                    <div>
                                        <small>Pow</small>
                                        <span className="headline-font text-xl font-bold">{getSkillShort(player.skill)}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="lineup-chip rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-(--foreground)">
                                            {getLineupMarker(player, index)}
                                        </span>
                                        <span className="headline-font text-lg font-bold">{player.name}</span>
                                        <RoleBadge role={player.role} />
                                    </div>
                                    <p className="mt-1 text-sm text-(--muted)">
                                        {player.role === 'setter'
                                            ? 'Core playmaker card'
                                            : player.role === 'attacker'
                                                ? 'Primary attacker card'
                                                : 'Rotation player card'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <select
                                    value={player.skill}
                                    onChange={(event) => onUpdatePlayerSkill(player.id, event.target.value)}
                                    disabled={player.enabled === false}
                                    className="rounded-2xl border border-(--line) bg-white/85 px-3 py-2 text-sm font-semibold text-(--foreground) outline-none transition focus:border-(--accent)"
                                >
                                    {SKILL_LEVEL_OPTIONS.map((skill) => (
                                        <option key={skill.value} value={skill.value}>
                                            {skill.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={player.role}
                                    onChange={(event) => onUpdatePlayerRole(player.id, event.target.value)}
                                    disabled={player.enabled === false}
                                    className="rounded-2xl border border-(--line) bg-white/85 px-3 py-2 text-sm font-semibold text-(--foreground) outline-none transition focus:border-(--accent)"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="setter">Setter</option>
                                    <option value="attacker">Attacker</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={() => onTogglePlayerEnabled(player.id)}
                                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${player.enabled === false
                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:-translate-y-0.5'
                                        : 'border-(--line) bg-white/80 text-(--muted) hover:-translate-y-0.5 hover:border-amber-300 hover:text-amber-700'}`}
                                >
                                    {player.enabled === false ? 'Enable' : 'Disable'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onRemovePlayer(player.id)}
                                    className="rounded-full border border-(--line) bg-white/80 px-3 py-2 text-sm font-semibold text-(--muted) transition hover:-translate-y-0.5 hover:border-red-200 hover:text-(--danger)"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-(--line) pt-5">
                <p className="text-sm text-(--muted)">
                    {players.length} players ({activePlayers.length} active), {players.filter((player) => player.role === 'setter').length} setters, {players.filter((player) => player.role === 'attacker').length} attackers
                </p>
            </div>
        </section>
    );
}