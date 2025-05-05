export default function Logo() {
    return (
        <div className="flex items-center">
            <svg
                width="40"
                height="40"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
            >
                <circle cx="50" cy="50" r="45" fill="black" stroke="#0D9488" strokeWidth="5" />
                <path d="M30 55C33.866 55 37 51.866 37 48C37 44.134 33.866 41 30 41C26.134 41 23 44.134 23 48C23 51.866 26.134 55 30 55Z" fill="#0D9488" />
                <path d="M70 55C73.866 55 77 51.866 77 48C77 44.134 73.866 41 70 41C66.134 41 63 44.134 63 48C63 51.866 66.134 55 70 55Z" fill="#0D9488" />
                <path d="M35 70C42.5 80 57.5 80 65 70" stroke="#0D9488" strokeWidth="5" strokeLinecap="round" />
                <path d="M25 30C35 20 65 20 75 30" stroke="#0D9488" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-bold text-white">Mood<span className="text-green-500">Ingo</span></span>
        </div>
    );
}