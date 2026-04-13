'use client';

import { SKILL_LEVEL_OPTIONS } from '@/lib/skill-levels';

const defaultValues = {
    name: '',
    skill: 'normal',
    role: 'normal',
};

export default function PlayerForm({ draftPlayer, onDraftChange, onAddPlayer, onLoadSample }) {
    const currentPlayer = draftPlayer ?? defaultValues;

    function updateField(field, value) {
        onDraftChange({
            ...currentPlayer,
            [field]: value,
        });
    }

    return (
        <section className="glass-panel stagger-in rounded-4xl p-6 md:p-7" data-delay="1">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--accent-strong)">
                        Player Input
                    </p>
                    <h2 className="headline-font mt-2 text-2xl font-bold">Add players with skill and role</h2>
                </div>
                <button
                    type="button"
                    onClick={onLoadSample}
                    className="rounded-full border border-(--line) bg-white/70 px-4 py-2 text-sm font-semibold text-(--foreground) transition hover:-translate-y-0.5 hover:border-(--accent)"
                >
                    Load sample roster
                </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.5fr_0.7fr_0.8fr_auto] md:items-end">
                <label className="space-y-2">
                    <span className="text-sm font-medium text-(--muted)">Name</span>
                    <input
                        value={currentPlayer.name}
                        onChange={(event) => updateField('name', event.target.value)}
                        placeholder="Player name"
                        className="w-full rounded-2xl border border-(--line) bg-white px-4 py-3 outline-none transition focus:border-(--accent)"
                    />
                </label>

                <label className="space-y-2">
                    <span className="text-sm font-medium text-(--muted)">Level</span>
                    <select
                        value={currentPlayer.skill}
                        onChange={(event) => updateField('skill', event.target.value)}
                        className="w-full rounded-2xl border border-(--line) bg-white px-4 py-3 outline-none transition focus:border-(--accent)"
                    >
                        {SKILL_LEVEL_OPTIONS.map((skill) => (
                            <option key={skill.value} value={skill.value}>
                                {skill.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="space-y-2">
                    <span className="text-sm font-medium text-(--muted)">Role</span>
                    <select
                        value={currentPlayer.role}
                        onChange={(event) => updateField('role', event.target.value)}
                        className="w-full rounded-2xl border border-(--line) bg-white px-4 py-3 outline-none transition focus:border-(--accent)"
                    >
                        <option value="normal">Normal</option>
                        <option value="setter">Setter</option>
                        <option value="attacker">Attacker</option>
                    </select>
                </label>

                <button
                    type="button"
                    onClick={onAddPlayer}
                    className="rounded-2xl bg-(--foreground) px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-(--accent-strong)"
                >
                    Add player
                </button>
            </div>
        </section>
    );
}