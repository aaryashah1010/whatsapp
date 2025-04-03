import { create } from 'zustand';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) {
      set({ currentUser: null, isLoading: false });
      return;
    }

    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        set({ currentUser: userData, isLoading: false });

        // Update online status
        await updateDoc(docRef, {
          online: true,
          lastSeen: serverTimestamp(),
        });

        // Set offline on window close
        window.addEventListener('beforeunload', async () => {
          await updateDoc(docRef, {
            online: false,
            lastSeen: serverTimestamp(),
          });
        });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      set({ currentUser: null, isLoading: false });
    }
  },
}));
