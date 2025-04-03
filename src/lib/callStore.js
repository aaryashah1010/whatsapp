import { create } from 'zustand';

export const useCallStore = create((set) => ({
    callId: null,
    setCallId: (id) => set({ callId: id }),
    endCall: () => set({ callId: null }),
}));
