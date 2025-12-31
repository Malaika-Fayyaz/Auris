declare module 'espeak-ng' {
  interface SpeakOptions {
    voice?: string;
    speed?: number;
    pitch?: number;
    callback: (err: Error | null, data: Buffer) => void;
  }

  function speak(text: string, options: SpeakOptions): void;

  export = {
    speak
  };
} 