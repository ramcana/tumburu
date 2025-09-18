export const isValidPrompt = (prompt: string) => prompt.length >= 3 && prompt.length <= 512;
export const isValidBPM = (bpm: number) => bpm >= 40 && bpm <= 300;
export const isValidDuration = (duration: number) => duration > 0 && duration <= 600;