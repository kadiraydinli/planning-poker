import { AnimatePresence, motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { BiBarChartAlt2, BiPieChart } from 'react-icons/bi';

import { getPointColor } from '@/lib/colorMap';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Vote, VoteDataItem } from '@/types';

interface VoteResultsProps {
    revealed: boolean;
    votes: Vote;
    roomId: string;
    chartType?: 'pie' | 'bar';
    isAdmin: boolean;
}

const VoteResults: React.FC<VoteResultsProps> = ({
    revealed,
    votes,
    roomId,
    chartType = 'pie',
    isAdmin
}) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [currentChartType, setCurrentChartType] = useState<'pie' | 'bar'>(chartType);

    // chartType değiştiğinde state'i güncelle
    useEffect(() => {
        setCurrentChartType(chartType);
    }, [chartType]);

    // Grafik türünü değiştir
    const changeChartType = async (newType: 'pie' | 'bar') => {
        if (!isAdmin) {
            toast.error(t.room.onlyAdminCanChange);
            return;
        }

        try {
            setCurrentChartType(newType);
            const roomRef = doc(db, 'rooms', roomId);
            await updateDoc(roomRef, {
                chartType: newType
            });
        } catch (error) {
            console.error('Error changing chart type:', error);
            toast.error(t.room.error);
        }
    };

    // Oyları gruplandır: Kaç kişi hangi puanı vermiş
    const groupedVotes: { [key: string]: number } = {};
    Object.values(votes).forEach((point) => {
        if (!point) return;
        groupedVotes[point] = (groupedVotes[point] || 0) + 1;
    });

    // Gruplandırılmış oyları chart verisi formatına çevir
    const voteData: VoteDataItem[] = Object.entries(groupedVotes).map(([point, count]) => ({
        name: point,
        value: count,
        point: point,
        count: count
    })).sort((a, b) => {
        // Sayısal değerler için numerik sıralama
        const aNum = parseFloat(a.point);
        const bNum = parseFloat(b.point);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
        }
        // Sayısal olmayan değerler için alfabetik sıralama
        return a.point.localeCompare(b.point);
    });

    const calculateAverageScore = (votes: Vote): number => {
        const validVotes = Object.values(votes).filter(vote => {
            // Herhangi bir sayısal olmayan değeri veya NaN sonucu veren değerleri filtrele
            return !isNaN(parseFloat(vote)) && isFinite(parseFloat(vote));
        });

        if (validVotes.length === 0) return 0;

        const totalScore = validVotes.reduce((total, point) => total + parseFloat(point), 0);
        return totalScore / validVotes.length;
    };

    const averageScore = calculateAverageScore(votes).toFixed(1);

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
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t.common.voteResults}
                    </h2>
                    
                    {/* Grafik tipi değiştirme butonları - sadece admine göster */}
                    {isAdmin && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => changeChartType('pie')}
                                className={`p-2 rounded-md transition-colors ${
                                    currentChartType === 'pie' 
                                        ? theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white' 
                                        : theme === 'dark' ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                } hover:bg-indigo-400`}
                                title={t.room.switchToPieChart}
                            >
                                <BiPieChart size={20} />
                            </button>
                            <button 
                                onClick={() => changeChartType('bar')}
                                className={`p-2 rounded-md transition-colors ${
                                    currentChartType === 'bar' 
                                        ? theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white' 
                                        : theme === 'dark' ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                } hover:bg-indigo-400`}
                                title={t.room.switchToBarChart}
                            >
                                <BiBarChartAlt2 size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Ortalama bilgisi - her iki chart tipinde de aynı konumda göster */}
                <div className={`text-center mb-2 py-1 px-3 rounded-lg inline-block mx-auto ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t.common.average}: 
                    </span>
                    <span className={`ml-1 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {averageScore}
                    </span>
                </div>

                {/* Chart ve Ortalama göster */}
                <div className="flex flex-col items-center">
                    {/* Chart Container */}
                    <div className="w-full max-w-md h-64 mb-4 p-2 rounded-xl" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {currentChartType === 'pie' ? (
                                <PieChart>
                                    <Pie
                                        data={voteData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={90}
                                        innerRadius={0}
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
                                </PieChart>
                            ) : (
                                <BarChart 
                                    data={voteData}
                                    layout="horizontal"
                                    margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                                >
                                    <XAxis 
                                        dataKey="point" 
                                        tick={{ fill: theme === 'dark' ? '#ffffff' : '#333333' }}
                                    />
                                    <YAxis 
                                        hide={false}
                                        tick={{ fill: theme === 'dark' ? '#9ca3af' : '#64748b' }}
                                    />
                                    <Tooltip 
                                        formatter={(value: number) => [`${value} ${value === 1 ? t.common.voteText : t.common.votesText}`, '']}
                                        contentStyle={{
                                            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                            borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                                            color: theme === 'dark' ? '#ffffff' : '#1e293b',
                                        }}
                                    />
                                    <Bar 
                                        dataKey="value" 
                                        name="Votes"
                                    >
                                        {voteData.map((entry, index) => (
                                            <Cell 
                                                key={`bar-${index}`} 
                                                fill={getPointColor(entry.point)} 
                                            />
                                        ))}
                                        <LabelList 
                                            dataKey="value" 
                                            position="top" 
                                            fill={theme === 'dark' ? '#ffffff' : '#000000'} 
                                        />
                                    </Bar>
                                </BarChart>
                            )}
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