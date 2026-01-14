
export interface AppState {
  isSplashScreen: boolean;
  isPlaying: boolean;
  currentTime: Date;
  activeView: 'player' | 'contact' | 'prayer' | 'praise';
}

export type MessageType = 'prayer' | 'praise';
