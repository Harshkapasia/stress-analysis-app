import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-black border-b border-green-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Logo />
                    </div>
                </div>
            </div>


        </nav>
    );
}