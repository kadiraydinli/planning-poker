import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { nanoid } from 'nanoid';

import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUserId } from '@/hooks/useUserId';

export const useRoom = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [scaleType, setScaleType] = useState('fibonacci');
  const [showNameModal, setShowNameModal] = useState(false);
  const [userName, setUserName] = useLocalStorage('planningPokerUserName', '');
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const userId = useUserId();

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error(t.room.enterNameFirst);
      return;
    }

    // Kullanıcı adı yoksa, önce modal'ı gösterelim
    if (!userName.trim()) {
      // Oda adını ve ölçek tipini geçici olarak state'de tutuyoruz
      // Oda oluşturma işlemi handleJoinAsAdmin içinde yapılacak
      setShowNameModal(true);
    } else {
      // Kullanıcı adı varsa doğrudan oda oluştur
      createAndJoinRoom(userName);
    }
  };

  const createAndJoinRoom = async (name: string) => {
    if (!roomName.trim() || !name.trim()) {
      toast.error(t.room.enterNameFirst);
      return;
    }

    setIsCreating(true);
    const newRoomId = nanoid(10);
    setRoomId(newRoomId);

    try {
      const sessionId = nanoid(16);
      localStorage.setItem(`planningPokerSession_${newRoomId}`, sessionId);

      await setDoc(doc(db, 'rooms', newRoomId), {
        name: roomName,
        scaleType,
        votes: {},
        revealed: false,
        users: {},
        createdAt: new Date().toISOString(),
        adminId: userId
      });

      setIsCreating(false);

      // Odayı oluşturduktan sonra kullanıcıyı oda sahibi olarak ekle
      joinRoomWithUserName(newRoomId, name, sessionId);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error(t.room.error);
      setIsCreating(false);
    }
  };

  const joinRoomWithUserName = async (roomIdToJoin: string, name: string, sessionId: string) => {
    try {
      // Firestore'a kullanıcıyı admin olarak ekle
      const roomRef = doc(db, 'rooms', roomIdToJoin);
      const userKey = nanoid(8);

      await updateDoc(roomRef, {
        [`users.${userKey}`]: {
          name: name,
          isAdmin: true,
          joinedAt: new Date().toISOString(),
          sessionId: sessionId,
          userId: userId
        }
      });

      // Odaya yönlendir
      router.push(`/room/${roomIdToJoin}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error(t.room.errorJoining);
    }
  };

  const handleJoinAsAdmin = async (name: string) => {
    if (!name.trim()) {
      toast.error(t.room.enterNameFirst);
      return;
    }

    setUserName(name);
    setIsJoining(true);

    try {
      // Eğer henüz bir roomId yoksa, oda oluşturma işlemini başlat
      if (!roomId) {
        await createAndJoinRoom(name);
      } else {
        // Mevcut odayı kontrol et - aynı isimde başka kullanıcı var mı?
        try {
          const roomRef = doc(db, 'rooms', roomId);
          const roomDoc = await getDoc(roomRef);

          if (roomDoc.exists()) {
            const roomData = roomDoc.data();
            const sessionId = localStorage.getItem(`planningPokerSession_${roomId}`) || nanoid(16);

            // Aynı isimde başka bir kullanıcı var mı?
            interface UserData {
              name: string;
              sessionId?: string;
            }

            const existingUser = Object.values(roomData.users || {}).find((user) => {
              const userData = user as UserData;
              return userData.name.toLowerCase() === name.toLowerCase() &&
                userData.sessionId !== sessionId;
            });

            if (existingUser) {
              toast.error(t.room.userExists);
              setIsJoining(false);
              return;
            }

            // Session ID yoksa oluştur
            if (!localStorage.getItem(`planningPokerSession_${roomId}`)) {
              localStorage.setItem(`planningPokerSession_${roomId}`, sessionId);
            }

            await joinRoomWithUserName(roomId, name, sessionId);
          } else {
            toast.error(t.room.roomNotFound);
          }
        } catch (error) {
          console.error('Error checking room:', error);
          toast.error(t.room.error);
        }
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error(t.room.errorJoining);
    } finally {
      setIsJoining(false);
      setShowNameModal(false);
    }
  };

  return {
    roomName,
    setRoomName,
    scaleType,
    setScaleType,
    isCreating,
    showNameModal,
    setShowNameModal,
    isJoining,
    handleCreateRoom,
    handleJoinAsAdmin
  };
}; 