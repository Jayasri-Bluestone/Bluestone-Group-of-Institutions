import React from 'react';

const LoadingScreen = ({ message = "Loading Content...", fullPage = true }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${fullPage ? 'min-h-screen' : 'py-20'} bg-slate-50/50 backdrop-blur-sm`}>
            {/* The Outer Ring */}
            <div className="relative flex items-center justify-center">
                {/* Static Outer Border */}
                <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                
                {/* Animated Spinning Ring */}
                <div className="absolute top-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                
                {/* Center Pulse Dot */}
                <div className="absolute w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
            </div>

            {/* Loading Text */}
            <div className="mt-6 flex flex-col items-center gap-1">
                <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">
                    {message}
                </p>
                <div className="h-1 w-24 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 animate-[loading-bar_1.5s_infinite_ease-in-out]"></div>
                </div>
            </div>

            {/* CSS for custom animation if not in tailwind config */}
            <style jsx>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;