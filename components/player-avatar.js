'use client';

function HomeAvatar() {
    return (
        <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className="h-full w-full">
            <circle cx="48" cy="34" r="17" fill="#e2be8d" />
            <path d="M26 31c0-12 10-20 22-20h8c11 0 19 8 19 18v11H26V31Z" fill="#6f5258" />
            <path d="M22 80c2-15 13-24 26-24h1c13 0 24 9 26 24H22Z" fill="#ff6a58" />
            <path d="M22 80c1-8 6-13 12-16 3 3 8 6 14 6 5 0 10-2 13-5 6 3 11 8 12 15H22Z" fill="#cf514f" opacity="0.75" />
            <path d="M24 78v-8l11 5v5l-11-2ZM72 78v-8l-11 5v5l11-2Z" fill="#cf514f" />
            <path d="M31 61h34l-17 11-17-11Z" fill="#cf514f" />
            <path d="M65 76h9a4 4 0 0 0 4-4v-2h-9v6Z" fill="#ffc338" />
            <path d="M19 76h9v-6h-9v2a4 4 0 0 0 4 4Z" fill="#ffc338" />
        </svg>
    );
}

function AwayAvatar() {
    return (
        <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className="h-full w-full">
            <circle cx="48" cy="34" r="17" fill="#e9cda1" />
            <path d="M26 34c0-11 8-18 19-18h8c11 0 19 7 19 17v8H26v-7Z" fill="#4a3327" />
            <path d="M22 80c2-15 13-24 26-24h1c13 0 24 9 26 24H22Z" fill="#f2f3f5" />
            <path d="M26 75v-10l10-2v12h-10ZM60 63l10 2v10H60V63ZM43 58h10v22H43V58Z" fill="#98bcdf" />
            <path d="M27 80c2-7 10-11 21-11 11 0 19 4 21 11H27Z" fill="#d7d7d7" />
            <path d="M41 57h14l-7 6-7-6Z" fill="#dfe6ee" />
        </svg>
    );
}

function resolveVariant(playerName, seedOffset = 0) {
    const hash = playerName.split('').reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
    return (hash + seedOffset) % 2 === 0 ? 'home' : 'away';
}

export default function PlayerAvatar({ playerName, seedOffset = 0, variant: forcedVariant, className = 'h-12 w-12' }) {
    const variant = forcedVariant ?? resolveVariant(playerName, seedOffset);

    return (
        <div className={`player-avatar-frame ${className}`}>
            {variant === 'home' ? <HomeAvatar /> : <AwayAvatar />}
        </div>
    );
}