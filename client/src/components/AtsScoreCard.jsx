import { useEffect, useState } from "react";

function AtsScoreCard({ data }) {
    const {
        score = 0,
        matchedCount = 0,
        missingCount = 0,
        topMatched = [],
        topMissing = [],
        suggestions = []
    } = data;

    const radius = 55;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = 2 * Math.PI * normalizedRadius;

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => setProgress(score), 300);
        return () => clearTimeout(timeout);
    }, [score]);

    const strokeDashoffset =
        circumference - (progress / 100) * circumference;

    return (
        <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-6 transition-all hover:-translate-y-1 duration-300">

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                    ATS Score
                </h2>

                <span className="px-4 py-1 text-sm rounded-full bg-purple-100 text-purple-700 font-semibold shadow-sm">
                    {score}% Match
                </span>
            </div>

            <div className="flex justify-center mb-6 relative">
                <svg height="150" width="140" className="drop-shadow-sm">

                    <circle
                        stroke="#e5e7eb"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx="70"
                        cy="70"
                    />

                    <circle
                        stroke="#8b5cf6"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        style={{
                            strokeDashoffset,
                            transition: "stroke-dashoffset 1s ease-out"
                        }}
                        r={normalizedRadius}
                        cx="70"
                        cy="70"
                    />

                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dy="0.3em"
                        className="text-3xl font-extrabold fill-gray-800"
                    >
                        {progress}
                    </text>
                </svg>

                <div className="absolute bottom-0 text-sm text-gray-500">
                    Resume Match Score
                </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-sm mb-5">
                <div className="px-3 py-2 bg-green-50 text-green-700 rounded-xl font-semibold w-[48%] text-center shadow-sm hover:scale-105 transition">
                    ✔ Matched: {matchedCount}
                </div>
                <div className="px-3 py-2 bg-red-50 text-red-600 rounded-xl font-semibold w-[48%] text-center shadow-sm hover:scale-105 transition">
                    ✖ Missing: {missingCount}
                </div>
            </div>


            <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    Top Matched Skills
                </p>
                <div className="flex flex-wrap gap-2">
                    {topMatched.map((item, i) => (
                        <span
                            key={i}
                            className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium shadow-sm hover:bg-green-200 transition cursor-pointer"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    Missing Keywords
                </p>
                <div className="flex flex-wrap gap-2">
                    {topMissing.map((item, i) => (
                        <span
                            key={i}
                            className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium shadow-sm hover:bg-red-200 transition cursor-pointer"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <div className="border-t pt-4">
                <p className="text-sm font-bold text-gray-700 mb-2">
                    💡 Suggestions
                </p>
                <ul className="space-y-2">
                    {suggestions.map((s, i) => (
                        <li
                            key={i}
                            className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AtsScoreCard;