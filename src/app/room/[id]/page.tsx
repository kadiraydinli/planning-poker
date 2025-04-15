'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getScaleValues } from '@/lib/scaleTypes';
import { nanoid } from 'nanoid';
import NameModal from '@/components/NameModal';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import PlayerCircle from '@/components/PlayerCircle';

interface Vote {
  [key: string]: string;
}

interface User {
  name: string;
  isAdmin: boolean;
  joinedAt: string;
  sessionId?: string;
}

interface Users {
  [key: string]: User;
}

interface Room {
  name: string;
  scaleType: string;
  votes: Vote;
  revealed: boolean;
  users: Users;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [userName, setUserName] = useLocalStorage('planningPokerUserName', '');
  const [showNameInput, setShowNameInput] = useState(!userName);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [points, setPoints] = useState<string[]>([]);
  
  // Kullanıcı session bilgilerini ref olarak sakla
  const userSessionRef = useRef({
    sessionId: '',
    userKey: null as string | null,
    initialized: false,
    checkingExistingUser: false
  });

  // Firestore session
  useEffect(() => {
    const roomId = id as string;
    const sessionStorageKey = `planningPokerSession_${roomId}`;
    
    // Session ID'yi yükle veya oluştur
    let sessionId = localStorage.getItem(sessionStorageKey);
    if (!sessionId) {
      sessionId = nanoid(16);
      localStorage.setItem(sessionStorageKey, sessionId);
    }
    userSessionRef.current.sessionId = sessionId;
    
    // Firestore listener başlat
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), async (docSnap) => {
      if (docSnap.exists()) {
        const roomData = docSnap.data() as Room;
        setRoom(roomData);
        
        // Kullanıcının oyu varsa seçili noktayı güncelleyelim
        if (userName && roomData.votes && roomData.votes[userName]) {
          setSelectedPoint(roomData.votes[userName]);
        } else if (roomData.votes && Object.keys(roomData.votes).length === 0) {
          // Eğer oy yoksa (oylar sıfırlanmışsa), selectedPoint'i null yap
          setSelectedPoint(null);
        }
        
        setPoints(getScaleValues(roomData.scaleType));
        
        // Sadece ilk kez veya userKey null ise kullanıcıyı kontrol et
        if (roomData.users && !userSessionRef.current.checkingExistingUser) {
          userSessionRef.current.checkingExistingUser = true;
          
          const userEntries = Object.entries(roomData.users);
          const existingUser = userEntries.find(([, user]) => 
            user.sessionId === userSessionRef.current.sessionId
          );
          
          if (existingUser) {
            // Kullanıcı zaten var
            userSessionRef.current.userKey = existingUser[0];
            
            // Kullanıcı adı yoksa ama session varsa, o kullanıcı adını kullan
            if (!userName && existingUser[1].name) {
              setUserName(existingUser[1].name);
            }
          }
          else if (userName) {
            // Kullanıcı henüz odada değil ama adı var, ekle
            await addUserToFirestore(roomId, userName, userSessionRef.current.sessionId);
          }
          else {
            // Kullanıcı yok ve adı da yok, modal göster
            setShowNameModal(true);
          }
          
          userSessionRef.current.initialized = true;
          userSessionRef.current.checkingExistingUser = false;
        }
      }
    });
    
    return () => unsubscribe();
  }, [id, userName]);
  
  // Kullanıcıyı odaya ekle
  const addUserToFirestore = async (roomId: string, name: string, sessionId: string) => {
    if (!name || !roomId || !sessionId) return null;
    
    try {
      const newUserKey = nanoid(8);
      const roomRef = doc(db, 'rooms', roomId);
      
      await updateDoc(roomRef, {
        [`users.${newUserKey}`]: { 
          name: name, 
          isAdmin: false, 
          joinedAt: new Date().toISOString(),
          sessionId: sessionId
        }
      });
      
      userSessionRef.current.userKey = newUserKey;
      return newUserKey;
    } catch (error) {
      console.error('Error adding user to room:', error);
      toast.error(t.room.errorJoining || 'Error joining room');
      return null;
    }
  };

  // Modal üzerinden kullanıcı katılımını işle
  const handleJoinRoom = async () => {
    if (!userName.trim()) {
      toast.error(t.room.enterNameFirst);
      return;
    }

    setIsJoining(true);
    try {
      const roomId = id as string;
      
      if (!userSessionRef.current.userKey) {
        await addUserToFirestore(
          roomId, 
          userName, 
          userSessionRef.current.sessionId
        );
      }
      
      setShowNameModal(false);
      toast.success(t.room.voteSaved || 'Successfully joined the room');
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error(t.room.errorJoining || 'Error joining room');
    } finally {
      setIsJoining(false);
    }
  };

  const handleVote = async (point: string) => {
    if (!userName) {
      toast.error(t.room.enterNameFirst);
      setShowNameModal(true);
      return;
    }

    try {
      await updateDoc(doc(db, 'rooms', id as string), {
        [`votes.${userName}`]: point,
      });
      setSelectedPoint(point);
    } catch (error) {
      toast.error(t.room.error);
      console.error('Error voting:', error);
    }
  };

  const handleReveal = async () => {
    try {
      await updateDoc(doc(db, 'rooms', id as string), {
        revealed: true,
      });
    } catch (error) {
      toast.error(t.room.error);
      console.error('Error revealing votes:', error);
    }
  };

  const handleReset = async () => {
    try {
      await updateDoc(doc(db, 'rooms', id as string), {
        votes: {},
        revealed: false,
      });
      setSelectedPoint(null);
    } catch (error) {
      toast.error(t.room.error);
      console.error('Error resetting votes:', error);
    }
  };

  const handleLeaveRoom = async () => {
    if (!userSessionRef.current.userKey || !id) return;
    
    try {
      // Mevcut kullanıcıyı Firebase'den sil
      const roomRef = doc(db, 'rooms', id as string);
      
      // Kullanıcının oyunu da silmek için votes nesnesini güncelle
      await updateDoc(roomRef, {
        [`users.${userSessionRef.current.userKey}`]: "",
        [`votes.${userName}`]: "",
      });
      
      // Session ID'yi sil
      localStorage.removeItem(`planningPokerSession_${id as string}`);

      toast.success(t.room.leftRoom || "You have left the room");
      
      // Ana sayfaya yönlendir (window.location yerine next router kullan)
      router.push('/');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error(t.room.error || "Error leaving room");
    }
  };

  if (!room) {
    return (
      <main className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} p-4 flex items-center justify-center`}>
        <Header />
        <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-xl`}>{t.common.loading}</div>
      </main>
    );
  }

  const voteData = Object.entries(room.votes).map(([name, point]) => ({
    name,
    value: 1,
    point,
  }));

  const calculateAverageScore = (votes: Vote): number => {
    const totalVotes = Object.values(votes).length;
    const totalScore = Object.values(votes).reduce((total, point) => total + parseFloat(point), 0);
    return totalScore / totalVotes;
  };

  return (
    <main className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} p-4`}>
      <Header />
      
      <div className="max-w-5xl mx-auto py-8">
        {/* Oda adı */}
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-center mb-6`}>{room.name}</h1>
        
        {showNameInput && (
          <div className={`mb-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t.common.enterName}
              className={`h-12 px-4 rounded-lg ${
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'border-gray-300 text-gray-900'
              } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base`}
            />
            <button
              onClick={() => userName && setShowNameInput(false)}
              className="ml-2 h-12 bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700"
            >
              {t.common.save}
            </button>
          </div>
        )}

        {/* Kullanıcı listesi ve butonlar */}
        <div className="mt-4">
          <PlayerCircle 
            users={room.users}
            votes={room.votes}
            revealed={room.revealed}
            onReveal={handleReveal}
            onReset={handleReset}
            currentUserName={userName}
            roomId={id as string}
          />
        </div>

        {room.revealed && (
          <div className={`mt-12 ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4 text-center`}>{t.common.voteResults}</h2>
            
            {/* Pie Chart ve Ortalama göster */}
            <div className="flex flex-col items-center">
              {/* Ortalama Puan */}
              {calculateAverageScore(room.votes) > 0 && (
                <div className="mb-6 text-center bg-blue-500 text-white rounded-xl px-6 py-3 shadow-lg">
                  <div className="text-sm mb-1">{t.common.averageScore}</div>
                  <div className="text-3xl font-bold">{calculateAverageScore(room.votes).toFixed(1)}</div>
                </div>
              )}

              {/* Pie Chart */}
              <div className="w-full max-w-md h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={voteData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, point }) => `${name}: ${point}`}
                    >
                      {voteData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                      {voteData.length} oy
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kart seçme alanı - ekranın altında sabitlenmiş */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {points.map((point) => (
              <button
                key={point}
                onClick={() => handleVote(point)}
                className={`w-14 h-20 rounded-lg text-center font-medium transition-colors transform ${
                  selectedPoint === point
                    ? `${theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-500'} text-white -translate-y-3`
                    : theme === 'dark'
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                } transition-transform duration-300`}
                disabled={room.revealed}
              >
                {point}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Odadan Çıkış Butonu */}
      <div className="fixed bottom-20 right-6">
        <button
          onClick={handleLeaveRoom}
          className={`flex items-center justify-center gap-2 h-12 px-5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all ${
            theme === 'dark'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          {t.room.leaveRoom || "Leave Room"}
        </button>
      </div>

      {/* Kullanıcı Adı Modal */}
      <NameModal 
        isOpen={showNameModal}
        userName={userName}
        isLoading={isJoining}
        onClose={() => setShowNameModal(false)}
        onChangeName={(name) => setUserName(name)}
        onSubmit={handleJoinRoom}
        showCancelButton={false}
        submitButtonText={t.room.joinRoom || 'Join Room'}
        loadingText={t.room.joining || 'Joining...'}
      />
    </main>
  );
} 