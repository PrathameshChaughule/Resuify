import { useEffect, useState } from "react";

function AtsComparisonCard({ data }) {
    const { before, after } = data;

    const [beforeProgress, setBeforeProgress] = useState(0);
    const [afterProgress, setAfterProgress] = useState(0);

    const radius = 45;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = 2 * Math.PI * normalizedRadius;

    useEffect(() => {
        const timer = setTimeout(() => {
            setBeforeProgress(before.score);
            setAfterProgress(after.score);
        }, 300);

        return () => clearTimeout(timer);
    }, [before.score, after.score]);

    const getOffset = (value) =>
        circumference - (value / 100) * circumference;

    const improvement = after.score - before.score;

    return (
        <div className="w-full max-w-md mx-auto backdrop-blur-md rounded-3xl p-6 transition-all duration-300">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                    ATS Improvement
                </h2>

                <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 font-semibold">
                    +{improvement}% 🚀
                </span>
            </div>

            {/* BEFORE - AFTER SECTION */}
            <div className="flex items-center justify-between mb-6">

                {/* BEFORE */}
                <div className="flex flex-col items-center w-[45%]">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                        BEFORE
                    </p>

                    <svg height="110" width="110">
                        <circle
                            stroke="#e5e7eb"
                            fill="transparent"
                            strokeWidth={stroke}
                            r={normalizedRadius}
                            cx="55"
                            cy="55"
                        />
                        <circle
                            stroke="#ef4444"
                            fill="transparent"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            style={{
                                strokeDashoffset: getOffset(beforeProgress),
                                transition: "stroke-dashoffset 1s ease-out"
                            }}
                            r={normalizedRadius}
                            cx="55"
                            cy="55"
                        />
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dy="0.3em"
                            className="text-lg font-bold fill-gray-800"
                        >
                            {beforeProgress}%
                        </text>
                    </svg>
                </div>

                {/* ARROW */}
                <div className="text-2xl font-bold text-gray-400 animate-pulse">
                    →
                </div>

                {/* AFTER */}
                <div className="flex flex-col items-center w-[45%]">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                        AFTER
                    </p>

                    <svg height="110" width="110">
                        <circle
                            stroke="#e5e7eb"
                            fill="transparent"
                            strokeWidth={stroke}
                            r={normalizedRadius}
                            cx="55"
                            cy="55"
                        />
                        <circle
                            stroke="#22c55e"
                            fill="transparent"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            style={{
                                strokeDashoffset: getOffset(afterProgress),
                                transition: "stroke-dashoffset 1s ease-out"
                            }}
                            r={normalizedRadius}
                            cx="55"
                            cy="55"
                        />
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dy="0.3em"
                            className="text-lg font-bold fill-gray-800"
                        >
                            {afterProgress}%
                        </text>
                    </svg>
                </div>
            </div>

            {/* SKILLS SECTION */}
            <div className="space-y-4 border-t pt-4">

                {/* Added Skills */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                        ✔ Added Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {after.matchedSkills
                            .filter(skill => !before.matchedSkills.includes(skill))
                            .map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                                >
                                    + {skill}
                                </span>
                            ))}
                    </div>
                </div>

                {/* Fixed / Improved */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                        ⚡ Improved Coverage
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {after.matchedSkills
                            .filter(skill => before.missingSkills.includes(skill))
                            .map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                >
                                    ✓ {skill}
                                </span>
                            ))}
                    </div>
                </div>

                {/* Still Missing */}
                {after.missingSkills.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                            ✖ Still Missing
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {after.missingSkills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AtsComparisonCard;