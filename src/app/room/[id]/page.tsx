'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, getDoc, deleteField, FieldValue } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence } from 'framer-motion';

import { db } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUserId } from '@/hooks/useUserId';
import { getScaleValues } from '@/lib/scaleTypes';
import NameModal from '@/components/NameModal';
import PlayerCircle from '@/components/PlayerCircle';
import RoomNotFound from '@/components/RoomNotFound';
import ConfirmModal from '@/components/ConfirmModal';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import RoomHeader from '@/components/RoomHeader';

interface Vote {
  [key: string]: string;
}

interface User {
  name: string;
  isAdmin: boolean;
  joinedAt: string;
  sessionId?: string;
  userId?: string;
  isConnected?: boolean;
  deletedAt?: string;
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
  adminId?: string;
  deletedAt?: string;
}

// Renk paleti - daha canlı ve doygun renkler
const COLORS = [
  '#0066FF', // mavi
  '#FFD700', // altın
  '#FF1493', // pembe
  '#00BFFF', // açık mavi
  '#00FF7F', // yeşil
  '#FF4500', // turuncu-kırmızı
  '#9932CC', // mor
  '#FF8C00', // turuncu
  '#D4A76A', // kahve rengi (☕)
  '#E879F9'  // mor-pembe (?)
];

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [userName, setUserName] = useLocalStorage('planningPokerUserName', '');
  const [showNameModal, setShowNameModal] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const [points, setPoints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const userId = useUserId();

  // Kullanıcı session bilgilerini ref olarak sakla
  const userSessionRef = useRef({
    sessionId: '',
    userKey: null as string | null,
    initialized: false,
    checkingExistingUser: false,
    isLeaving: false // Kullanıcının odadan ayrıldığını takip et
  });

  // Yükleme timeout referansı
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAutoLeaveRoom = useCallback(async () => {
    // Eğer odaya katılmış bir kullanıcı yoksa, çıkış işlemi yapma
    if (!userSessionRef.current.userKey || !id || userSessionRef.current.isLeaving) return;

    try {
      const roomId = id as string;
      const roomRef = doc(db, 'rooms', roomId);

      // Kullanıcının güncel bilgilerini alalım
      const roomDoc = await getDoc(roomRef);
      if (!roomDoc.exists()) return;

      const roomData = roomDoc.data() as Room;
      const updates: Record<string, ReturnType<typeof deleteField> | boolean | string> = {
        [`users.${userSessionRef.current.userKey}.isConnected`]: false,
        [`users.${userSessionRef.current.userKey}.deletedAt`]: new Date().toISOString()
      };

      // Kullanıcının oyunu da sil
      if (userName && roomData.votes && roomData.votes[userName]) {
        updates[`votes.${userName}`] = deleteField();
      }

      // Kullanıcının isConnected durumunu false olarak ayarla, deletedAt ekle ve oyunu sil
      await updateDoc(roomRef, updates);

      // Eğer oylar sıfırlandı ve revealed true ise, revealed'ı false yap
      if (roomData.revealed) {
        // Tüm oyları sayalım (kullanıcının oyunu zaten sildik)
        const remainingVotes = Object.keys(roomData.votes).filter(
          voter => voter !== userName
        ).length;

        // Eğer başka oy yoksa, revealed'ı false yap
        if (remainingVotes === 0) {
          await updateDoc(roomRef, { revealed: false });
        }
      }
    } catch (error) {
      console.error('Error in auto leave room:', error);
    }
  }, [id, room, userName]);

  // Firestore session
  useEffect(() => {
    if (userSessionRef.current.isLeaving) {
      // Eğer kullanıcı çıkış yapıyorsa, Firestore işlemini yapmayı atla
      return;
    }

    const roomId = id as string;

    // Her oturum için session id oluştur
    if (!localStorage.getItem(`planningPokerSession_${roomId}`)) {
      localStorage.setItem(`planningPokerSession_${roomId}`, nanoid(16));

      // UserId'yi de localStorage'a kaydedelim
      if (userId) {
        localStorage.setItem(`planningPokerUserId_${roomId}`, userId);
      }
    } else {
      // Eğer önceki oturumdan userId varsa, onu kullanalım
      if (!userId && localStorage.getItem(`planningPokerUserId_${roomId}`)) {
        // Önceki userId'yi kullanalım
        const storedUserId = localStorage.getItem(`planningPokerUserId_${roomId}`);
        if (storedUserId) {
          console.log('Önceki userId kullanılıyor:', storedUserId);
        }
      } else if (userId) {
        // Güncel userId'yi kaydedelim
        localStorage.setItem(`planningPokerUserId_${roomId}`, userId);
      }
    }

    userSessionRef.current.sessionId = localStorage.getItem(`planningPokerSession_${roomId}`) || nanoid(16);

    // Yükleme zaman aşımı için bir timer ayarla (3 saniye)
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        // Belirli bir süre sonra hala yükleme devam ediyorsa, odanın bulunamadığını varsayalım
        setRoomNotFound(true);
        setIsLoading(false);
      }
    }, 3000);

    // İlk olarak doğrudan odanın varlığını kontrol et
    const checkRoomExists = async () => {
      try {
        const roomRef = doc(db, 'rooms', roomId);
        const roomDoc = await getDoc(roomRef);

        if (!roomDoc.exists()) {
          setRoomNotFound(true);
          setIsLoading(false);
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
        }
      } catch (error) {
        console.error('Error checking room:', error);
      }
    };

    // Oda kontrolünü başlat
    checkRoomExists();

    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), async (docSnap) => {
      if (userSessionRef.current.isLeaving) {
        // Kullanıcı çıkış yapıyorsa, snapshot'ı işleme
        return;
      }

      if (docSnap.exists()) {
        const roomData = docSnap.data() as Room;

        // Oda silinmiş mi kontrol et
        if (roomData.deletedAt && !userSessionRef.current.isLeaving) {
          // Oda silinmiş, kullanıcıyı bilgilendir ve ana sayfaya yönlendir
          toast.error(t.room.roomClosed);
          userSessionRef.current.isLeaving = true;
          router.push('/');
          return;
        }

        setRoom(roomData);
        setIsLoading(false);

        // Kullanıcının oyu varsa seçili noktayı güncelleyelim
        if (userName && roomData.votes && roomData.votes[userName]) {
          setSelectedPoint(roomData.votes[userName]);
        } else if (roomData.votes && Object.keys(roomData.votes).length === 0) {
          // Eğer oy yoksa (oylar sıfırlanmışsa), selectedPoint'i null yap
          setSelectedPoint(null);

          // Eğer revealed true ise ve oy sayısı 0 ise, revealed'ı false yap
          if (roomData.revealed) {
            const roomRef = doc(db, 'rooms', roomId);
            await updateDoc(roomRef, {
              revealed: false
            });
          }
        }

        setPoints(getScaleValues(roomData.scaleType));

        // Sadece ilk kez veya userKey null ise kullanıcıyı kontrol et
        if (roomData.users && !userSessionRef.current.checkingExistingUser && !userSessionRef.current.isLeaving) {
          userSessionRef.current.checkingExistingUser = true;

          const userEntries = Object.entries(roomData.users);
          const existingUser = userEntries.find(([, user]) =>
            (user as User).sessionId === userSessionRef.current.sessionId
          );

          if (existingUser) {
            // Kullanıcı zaten var
            userSessionRef.current.userKey = existingUser[0];

            // Kullanıcı adı yoksa ama session varsa, o kullanıcı adını kullan
            if (!userName && (existingUser[1] as User).name) {
              setUserName((existingUser[1] as User).name);
            }

            // Eğer kullanıcının isConnected durumu false ise, true yapalım
            if ((existingUser[1] as User).isConnected === false || (existingUser[1] as User).deletedAt) {
              const roomRef = doc(db, 'rooms', roomId);
              await updateDoc(roomRef, {
                [`users.${existingUser[0]}.isConnected`]: true,
                [`users.${existingUser[0]}.deletedAt`]: deleteField()
              });
            }
          }
          else if (userName && !userSessionRef.current.isLeaving) {
            // Kullanıcı henüz odada değil ama adı var
            // Eğer kullanıcı ID'si odanın adminId'si ile eşleşiyorsa, admin olarak ekle
            const isAdmin = roomData.adminId === userId;
            await addUserToFirestore(roomId, userName, userSessionRef.current.sessionId, isAdmin);
          }
          else if (!userSessionRef.current.isLeaving) {
            // Kullanıcı yok ve adı da yok, modal göster
            setShowNameModal(true);
          }

          userSessionRef.current.initialized = true;
          userSessionRef.current.checkingExistingUser = false;
        }
      } else {
        // Oda bulunamadı
        if (userSessionRef.current.isLeaving) {
          // Kullanıcı zaten çıkış yapıyorsa, roomNotFound'u gösterme
          return;
        }

        // Eğer daha önce bir odamız vardı ve şimdi yoksa (silindi)
        if (room && !userSessionRef.current.isLeaving) {
          // Admin odayı silmiş olabilir, ana sayfaya yönlendir
          toast.error(t.room.roomClosed);
          userSessionRef.current.isLeaving = true;
          router.push('/');
          return;
        }

        // İlk yükleme sırasında oda yoksa roomNotFound göster
        setRoomNotFound(true);
        setIsLoading(false);
      }
    });

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      unsubscribe();
    };
  }, [id, userName, isLoading, userId]);

  // Sekme kapatıldığında çalışacak otomatik çıkış efekti
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (userSessionRef.current.userKey && !userSessionRef.current.isLeaving) {
        handleAutoLeaveRoom();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [id, room, handleAutoLeaveRoom]);

  // Kullanıcıyı odaya ekle
  const addUserToFirestore = async (roomId: string, name: string, sessionId: string, isAdmin: boolean = false) => {
    if (!name || !roomId || !sessionId) return null;

    try {
      const newUserKey = nanoid(8);
      const roomRef = doc(db, 'rooms', roomId);

      // Aynı userId ile daha önce bir kullanıcı var mı kontrol et
      const roomDoc = await getDoc(roomRef);
      if (roomDoc.exists()) {
        const roomData = roomDoc.data() as Room;
        if (roomData.users) {
          const existingUserEntry = Object.entries(roomData.users).find(
            ([, user]) => user.userId === userId
          );

          if (existingUserEntry) {
            // Kullanıcı zaten var, isConnected değerini güncelle
            const [existingUserKey] = existingUserEntry;
            await updateDoc(roomRef, {
              [`users.${existingUserKey}.isConnected`]: true,
              [`users.${existingUserKey}.sessionId`]: sessionId,
              [`users.${existingUserKey}.name`]: name,
              [`users.${existingUserKey}.deletedAt`]: deleteField()
            });
            userSessionRef.current.userKey = existingUserKey;
            return existingUserKey;
          }
        }
      }

      // Yeni kullanıcı oluştur
      await updateDoc(roomRef, {
        [`users.${newUserKey}`]: {
          name: name,
          isAdmin: isAdmin,
          joinedAt: new Date().toISOString(),
          sessionId: sessionId,
          userId: userId,
          isConnected: true
        }
      });

      userSessionRef.current.userKey = newUserKey;
      return newUserKey;
    } catch (error) {
      console.error('Error adding user to room:', error);
      toast.error(t.room.errorJoining);
      return null;
    }
  };

  // Modal üzerinden kullanıcı katılımını işle
  const handleJoinRoom = async (name: string) => {
    if (!name.trim()) {
      toast.error(t.room.enterNameFirst);
      return;
    }

    // Aynı isimde başka bir kullanıcı var mı kontrol et
    if (room?.users) {
      const existingUser = Object.values(room.users).find(user =>
        user.name.toLowerCase() === name.toLowerCase() &&
        user.sessionId !== userSessionRef.current.sessionId
      );

      if (existingUser) {
        toast.error(t.room.userExists);
        return;
      }
    }

    setUserName(name);
    setIsJoining(true);
    try {
      const roomId = id as string;

      if (!userSessionRef.current.userKey) {
        // Eğer kullanıcı ID'si odanın adminId'si ile eşleşiyorsa, admin olarak ekle
        const isAdmin = room?.adminId === userId;
        await addUserToFirestore(
          roomId,
          name,
          userSessionRef.current.sessionId,
          isAdmin
        );
      }

      setShowNameModal(false);
      toast.success(t.room.voteSaved);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error(t.room.errorJoining);
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

  const handleUpdateName = async (newName: string) => {
    if (!newName.trim()) {
      toast.error(t.room.enterNameFirst);
      return;
    }

    if (!userSessionRef.current.userKey) {
      toast.error(t.room.error);
      return;
    }

    // Aynı isimde başka bir kullanıcı var mı kontrol et
    if (room?.users) {
      const existingUser = Object.values(room.users).find(user =>
        user.name.toLowerCase() === newName.toLowerCase() &&
        user.sessionId !== userSessionRef.current.sessionId
      );

      if (existingUser) {
        toast.error(t.room.userExists);
        return;
      }
    }

    try {
      const roomId = id as string;
      const roomRef = doc(db, 'rooms', roomId);

      // Eğer kullanıcının oyu varsa, oyunu da güncelle
      const updates: Record<string, string | FieldValue> = {};

      // Kullanıcı adını güncelle
      updates[`users.${userSessionRef.current.userKey}.name`] = newName;

      // Eğer eski isimle oyu varsa, oyları da güncelle
      if (room?.votes && room.votes[userName]) {
        const currentVote = room.votes[userName];
        updates[`votes.${newName}`] = currentVote;
        updates[`votes.${userName}`] = deleteField();
      }

      await updateDoc(roomRef, updates);

      // localStorage'daki ismi güncelle
      setUserName(newName);

      toast.success(t.common.nameUpdated);
    } catch (error) {
      console.error('Error updating user name:', error);
      toast.error(t.common.nameUpdateFailed);
    }
  };

  const handleLeaveRoom = () => {
    setShowLeaveConfirmModal(true);
  };

  const leaveRoomAction = async (isAdmin: boolean) => {
    if (!userSessionRef.current.userKey || !id) return;

    // Kullanıcının çıkış yaptığını işaretle
    userSessionRef.current.isLeaving = true;
    setIsLeavingRoom(true);

    try {
      const roomId = id as string;
      const roomRef = doc(db, 'rooms', roomId);

      if (isAdmin) {
        // Admin için işlem
        try {
          // Admin odayı siliyor
          await updateDoc(roomRef, {
            deletedAt: new Date().toISOString(),
          });

          toast.success(t.room.deletedRoom);

          // Başarılı olursa localStorage'dan session ID'yi sil
          localStorage.removeItem(`planningPokerSession_${roomId}`);

          // Ana sayfaya yönlendir
          router.push('/');
        } catch (error) {
          console.error('Error deleting room:', error);
          toast.error(t.room.error);

          // Hata olursa da çıkış yap
          localStorage.removeItem(`planningPokerSession_${roomId}`);
          router.push('/');
        }
      } else {
        // Normal kullanıcı için kullanıcı bilgisini güncelle
        try {
          const roomDoc = await getDoc(roomRef);

          if (!roomDoc.exists()) {
            toast.error(t.room.roomNotFound);
            localStorage.removeItem(`planningPokerSession_${roomId}`);
            router.push('/');
            return;
          }

          const roomData = roomDoc.data();
          const updates: Record<string, ReturnType<typeof deleteField> | boolean | string> = {
            [`users.${userSessionRef.current.userKey}.isConnected`]: false,
            [`users.${userSessionRef.current.userKey}.deletedAt`]: new Date().toISOString()
          };

          // Eğer kullanıcının oyu varsa, sil
          if (userName && roomData.votes && roomData.votes[userName]) {
            updates[`votes.${userName}`] = deleteField();
          }

          // Firestore güncellemesini yap
          await updateDoc(roomRef, updates);
          toast.success(t.room.leftRoom);

          // Başarılı olursa localStorage'dan session ID'yi sil
          localStorage.removeItem(`planningPokerSession_${roomId}`);

          // Ana sayfaya yönlendir
          router.push('/');
        } catch (error) {
          console.error('Error removing user from room:', error);
          toast.error(t.room.error);

          // Hata olursa da çıkış yap
          localStorage.removeItem(`planningPokerSession_${roomId}`);
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error in leaveRoomAction:', error);
      toast.error(t.room.error);

      // Genel bir hata durumunda da çıkış yap
      localStorage.removeItem(`planningPokerSession_${id as string}`);
      router.push('/');
    } finally {
      setIsLeavingRoom(false);
      setShowLeaveConfirmModal(false);
    }
  };

  if (roomNotFound && !userSessionRef.current.isLeaving) {
    return <RoomNotFound />;
  }

  if (isLoading || !room) {
    return (
      <main className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} p-4 flex items-center justify-center`}>
        <Header />
        <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-xl`}>{t.common.loading}</div>
      </main>
    );
  }

  // Oyları gruplandır: Kaç kişi hangi puanı vermiş
  const groupedVotes: { [key: string]: number } = {};
  Object.values(room.votes).forEach((point) => {
    if (!point) return;
    groupedVotes[point] = (groupedVotes[point] || 0) + 1;
  });

  // Gruplandırılmış oyları Pie Chart verisi formatına çevir
  const voteData = Object.entries(groupedVotes).map(([point, count]) => ({
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

  return (
    <main className={`min-h-screen max-h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} p-4`}>
      {/* Konfeti Efekti */}
      {room && (
        <ConfettiCelebration
          votes={room.votes}
          revealed={room.revealed}
        />
      )}

      <RoomHeader
        onLeaveRoom={handleLeaveRoom}
        onUpdateName={handleUpdateName}
        isAdmin={room?.users?.[userSessionRef.current.userKey || '']?.isAdmin || false}
      />
      <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
      </div>

      <div className="w-screen h-[50vh] relative items-center justify-center">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-center mb-6`}>
          {room.name}
        </h1>

        <div className="flex items-center justify-center w-full h-[60vh] overflow-visible flex-wrap"
          style={{
            width: room.revealed ? '70%' : '100%',
            padding: room.revealed ? '0 16px' : '0',
          }}>
          <PlayerCircle
            users={room.users}
            votes={room.votes}
            revealed={room.revealed}
            onReveal={handleReveal}
            onReset={handleReset}
            currentUserName={userName}
          />
        </div>

        {/* Pie Chart - Sadece revealed durumunda gösterilir */}
        <AnimatePresence>
          {room.revealed && (
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
                        paddingAngle={1.5}
                        dataKey="value"
                        label={false}
                        animationDuration={800}
                        animationBegin={0}
                      >
                        {voteData.map((entry, i) => {
                          // Kahve fincanı ve soru işareti için özel renkler kullan
                          let colorIndex;
                          if (entry.point === '☕') {
                            colorIndex = 8; // Kahve rengi (COLORS[8])
                          } else if (entry.point === '?') {
                            colorIndex = 9; // Mor-pembe (COLORS[9])
                          } else {
                            colorIndex = Math.abs(parseInt(entry.point)) % 8; // İlk 8 rengi kullan
                          }

                          return <Cell
                            key={`cell-${i}`}
                            fill={COLORS[colorIndex]}
                            strokeWidth={1}
                            stroke={'rgba(255,255,255,0.6)'}
                          />;
                        })}
                      </Pie>
                      {/* Ortadaki ortalama puan bilgisi */}
                      <text
                        x="50%"
                        y="45%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-normal"
                        fill={theme === 'dark' ? '#9ca3af' : '#64748b'}
                      >
                        {t.common.average}
                      </text>
                      <text
                        x="50%"
                        y="58%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-3xl font-bold"
                        fill={theme === 'dark' ? '#ffffff' : '#0f172a'}
                      >
                        {calculateAverageScore(room.votes).toFixed(1)}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Renk açıklamaları */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4">
                  {voteData.map((entry, i) => {
                    // Kahve fincanı ve soru işareti için özel renkler kullan
                    let colorIndex;
                    if (entry.point === '☕') {
                      colorIndex = 8; // Kahve rengi (COLORS[8])
                    } else if (entry.point === '?') {
                      colorIndex = 9; // Mor-pembe (COLORS[9])
                    } else {
                      colorIndex = Math.abs(parseInt(entry.point)) % 8; // İlk 8 rengi kullan
                    }

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
                            style={{ backgroundColor: COLORS[colorIndex] }}
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
          )}
        </AnimatePresence>
      </div>

      {/* Kart seçme alanı - ekranın altında sabitlenmiş */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {points.map((point) => {
              return (
                <button
                  key={point}
                  onClick={() => handleVote(point)}
                  className={`w-14 h-20 rounded-lg text-center font-medium transition-colors transform ${selectedPoint === point
                    ? `${theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-500'} text-white -translate-y-3`
                    : theme === 'dark'
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                    } transition-transform duration-300`}
                >
                  {point}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kullanıcı Adı Modal */}
      <NameModal
        isOpen={showNameModal}
        isLoading={isJoining}
        onClose={() => setShowNameModal(false)}
        onSubmit={handleJoinRoom}
        showCancelButton={false}
        submitButtonText={t.room.joinRoom}
        loadingText={t.room.joining}
      />

      {/* Odadan Çıkış veya Odayı Silme Onay Modalı */}
      <ConfirmModal
        isOpen={showLeaveConfirmModal}
        onClose={() => setShowLeaveConfirmModal(false)}
        onConfirm={() => leaveRoomAction(room?.users?.[userSessionRef.current.userKey || '']?.isAdmin || false)}
        title={room?.users?.[userSessionRef.current.userKey || '']?.isAdmin
          ? t.room.confirmDeleteRoomTitle
          : t.room.confirmLeaveTitle}
        message={room?.users?.[userSessionRef.current.userKey || '']?.isAdmin
          ? t.room.confirmDeleteRoomDescription
          : t.room.confirmLeaveDescription}
        confirmButtonText={room?.users?.[userSessionRef.current.userKey || '']?.isAdmin
          ? t.room.deleteRoom
          : t.room.leaveRoom}
        isLoading={isLeavingRoom}
      />
    </main>
  );
}