import { AnimatePresence, motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { getPointColor } from '@/lib/colorMap';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Vote, VoteDataItem } from '@/types';

interface VoteResultsProps {
    revealed: boolean;
    votes: Vote;
}

const VoteResults: React.FC<VoteResultsProps> = ({
    revealed,
    votes,
}) => {
    const { t } = useLanguage();
    const { theme } = useTheme();

    // Oyları gruplandır: Kaç kişi hangi puanı vermiş
    const groupedVotes: { [key: string]: number } = {};
    Object.values(votes).forEach((point) => {
        if (!point) return;
        groupedVotes[point] = (groupedVotes[point] || 0) + 1;
    });

    // Gruplandırılmış oyları Pie Chart verisi formatına çevir
    const voteData: VoteDataItem[] = Object.entries(groupedVotes).map(([point, count]) => ({
        name: point,
        value: count,
        point: point,
        count: count
    })).sort((a, b) => parseFloat(a.point) - parseFloat(b.point)); // Puanlara göre sırala

    const calculateAverageScore = (votes: Vote): number => {
        const validVotes = Object.values(votes).filter(vote => {
            // Herhangi bir sayısal olmayan değeri veya NaN sonucu veren değerleri filtrele
            return !isNaN(parseFloat(vote)) && isFinite(parseFloat(vote));
        });

        if (validVotes.length === 0) return 0;

        const totalScore = validVotes.reduce((total, point) => total + parseFloat(point), 0);
        return totalScore / validVotes.length;
    };

    if (!revealed) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={`absolute top-[70%] right-[64px] w-[40%] md:w-[25%] transform -translate-y-1/2 ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white'} rounded-2xl shadow-xl p-6`}
                initial={{ opacity: 0, x: 200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }}
                style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4 text-center`}>
                    {t.common.voteResults}
                </h2>

                {/* Pie Chart ve Ortalama göster */}
                <div className="flex flex-col items-center">
                    {/* Pie Chart */}
                    <div className="w-full max-w-md h-64 mb-4 p-2 rounded-xl" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={voteData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={90}
                                    innerRadius={60}
                                    fill="#8884d8"
                                    paddingAngle={0}
                                    dataKey="value"
                                    label={false}
                                    animationDuration={800}
                                    animationBegin={0}
                                >
                                    {voteData.map((entry, i) => {
                                        const pointColor = getPointColor(entry.point);

                                        return <Cell
                                            key={`cell-${i}`}
                                            fill={pointColor}
                                            strokeWidth={1}
                                            stroke={'white'}
                                        />;
                                    })}
                                </Pie>
                                {/* Ortadaki ortalama puan bilgisi */}
                                <text
                                    x="50%"
                                    y="42%"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-xs font-normal"
                                    fill={theme === 'dark' ? '#9ca3af' : '#64748b'}
                                >
                                    {t.common.average}
                                </text>
                                <text
                                    x="50%"
                                    y="55%"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-3xl font-bold"
                                    fill={theme === 'dark' ? '#ffffff' : '#0f172a'}
                                >
                                    {calculateAverageScore(votes).toFixed(1)}
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Renk açıklamaları */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4">
                        {voteData.map((entry, i) => {
                            const pointColor = getPointColor(entry.point);

                            return (
                                <motion.div
                                    key={`legend-${i}`}
                                    className="flex flex-col items-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1), duration: 0.4 }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: pointColor }}
                                        ></div>
                                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                                            {entry.point}
                                        </span>
                                    </div>
                                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                        {entry.count} {entry.count === 1 ? t.common.voteText : t.common.votesText}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VoteResults; 