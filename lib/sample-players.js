const baseSamplePlayers = [
    { name: 'Garry', skill: 'master', role: 'setter' },
    { name: 'Jude', skill: 'good', role: 'setter' },
    { name: 'Levi', skill: 'master', role: 'attacker' },
    { name: 'Alex', skill: 'normal', role: 'normal' },
    { name: 'Sam', skill: 'normal', role: 'normal' },
    { name: 'Franky', skill: 'good', role: 'normal' },
    { name: 'Harold', skill: 'normal', role: 'normal' },
    { name: 'Roger', skill: 'master', role: 'attacker' },
    { name: 'Mike', skill: 'master', role: 'attacker' },
    { name: 'Paladin', skill: 'master', role: 'normal' },
    { name: 'Toby', skill: 'good', role: 'attacker' },
    { name: 'Egan', skill: 'master', role: 'attacker' },
    { name: 'Hubert', skill: 'master', role: 'normal' },
    { name: 'Lionel', skill: 'normal', role: 'normal' }
];

export function createSamplePlayers() {
    return baseSamplePlayers.map((player) => ({
        ...player,
        id: crypto.randomUUID(),
    }));
}