import React from "react";

const cutoffData = [
  { score: "135+", rank: "1-100" },
  { score: "134-120", rank: "101-200" },
  { score: "119-110", rank: "201-500" },
  { score: "109-100", rank: "501-1000" },
  { score: "99-85", rank: "1001-2000" },
  { score: "84-80", rank: "2001-3000" },
  { score: "79-77", rank: "3001-4000" },
  { score: "76-73", rank: "4001-5000" },
  { score: "72-64", rank: "5001-10000" },
  { score: "63-60", rank: "10001-15000" },
  { score: "59-57", rank: "15001-20000" },
  { score: "56-55", rank: "20001-25000" },
  { score: "54-53", rank: "25001-30000" },
  { score: "52-51", rank: "30001-40000" },
  { score: "50-49", rank: "40001-50000" },
  { score: "48-47", rank: "50001-65000" },
  { score: "46", rank: "65001-Last" },
];

export default function CutoffPage() {
  return (
    <div className="min-h-screen bg-gray-600 py-10 px-2 md:px-0 font-raleway">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-10 text-center tracking-tight font-raleway">
          Mark's vs Rank
        </h1>
        <div className="overflow-x-auto rounded-xl shadow-md bg-blue-600/90 p-6">
          <table className="min-w-full text-left text-white font-raleway">
            <thead>
              <tr>
                <th className="px-6 py-3 text-lg font-bold">Overall Score</th>
                <th className="px-6 py-3 text-lg font-bold">Expected Rank</th>
              </tr>
            </thead>
            <tbody>
              {cutoffData.map((row, idx) => (
                <tr key={idx} className="border-b border-blue-400/30 last:border-none">
                  <td className="px-6 py-2 whitespace-nowrap">{row.score}</td>
                  <td className="px-6 py-2 whitespace-nowrap">{row.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
