'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, getDoc, deleteField, FieldValue } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { nanoid } from 'nanoid';

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
import VoteResults from '@/components/VoteResults';
import { Room, User } from '@/types';

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
    } else if (userId && !localStorage.getItem(`planningPokerUserId_${roomId}`)) {
      // Güncel userId'yi kaydedelim
      localStorage.setItem(`planningPokerUserId_${roomId}`, userId);
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

        <VoteResults
          revealed={room.revealed}
          votes={room.votes}
        />
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