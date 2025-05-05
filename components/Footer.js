export default function Footer() {
    return (
        <footer className="bg-black border-t border-green-900">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center">
                    <div className="text-gray-400 text-sm ">
                        © {new Date().getFullYear()} MoodIngo. All rights reserved.
                    </div>
                    
                </div>
            </div>
        </footer>
    );
}