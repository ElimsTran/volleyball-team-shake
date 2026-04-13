export const SKILL_LEVEL_OPTIONS = [
    { value: 'beginner', label: 'Beginner', short: 'B', score: 1 },
    { value: 'normal', label: 'Normal', short: 'N', score: 2 },
    { value: 'good', label: 'Good', short: 'G', score: 3 },
    { value: 'master', label: 'Master', short: 'M', score: 4 },
];

const skillLookup = SKILL_LEVEL_OPTIONS.reduce((accumulator, option) => {
    accumulator[option.value] = option;
    return accumulator;
}, {});

export function isValidSkillLevel(skillLevel) {
    return Boolean(skillLookup[skillLevel]);
}

export function getSkillLabel(skillLevel) {
    return skillLookup[skillLevel]?.label ?? 'Normal';
}

export function getSkillShort(skillLevel) {
    return skillLookup[skillLevel]?.short ?? 'N';
}

export function getSkillScore(skillLevel) {
    return skillLookup[skillLevel]?.score ?? 2;
}