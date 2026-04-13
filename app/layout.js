import { Space_Grotesk, Sora } from 'next/font/google';
import './globals.css';

const headingFont = Space_Grotesk({
    variable: '--font-heading',
    subsets: ['latin'],
});

const bodyFont = Sora({
    variable: '--font-body',
    subsets: ['latin'],
});

export const metadata = {
    title: 'Volleyball Team Shake',
    description: 'Frontend-only volleyball team generator with setter constraints.',
    icons: {
        icon: '/volleyball-logo.png',
        shortcut: '/volleyball-logo.png',
        apple: '/volleyball-logo.png',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${headingFont.variable} ${bodyFont.variable}`}>
                {children}
            </body>
        </html>
    );
}