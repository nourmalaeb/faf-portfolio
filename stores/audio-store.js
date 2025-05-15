import { create } from 'zustand';

const useAudioStore = create(set => ({
  currentlyPlayingId: null, // Holds the unique ID of the currently playing audio player
  setCurrentlyPlayingId: id => set({ currentlyPlayingId: id }),
  pauseAll: () => set({ currentlyPlayingId: null }), // Optional: action to pause all
}));

export default useAudioStore;
