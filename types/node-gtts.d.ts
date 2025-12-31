declare module 'node-gtts' {
  class gTTS {
    constructor(lang: string);
    save(filepath: string, text: string, callback: (err: Error | null) => void): void;
  }
  export = gTTS;
} 