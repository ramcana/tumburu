// Web Audio API utilities for buffer loading, analysis, and export

export async function fetchAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return await context.decodeAudioData(arrayBuffer);
}

export function getPeaks(buffer: AudioBuffer, samples = 1000): number[] {
  const channel = buffer.getChannelData(0);
  const blockSize = Math.floor(channel.length / samples);
  const peaks = [];
  for (let i = 0; i < samples; i++) {
    let max = 0;
    for (let j = 0; j < blockSize; j++) {
      const idx = i * blockSize + j;
      if (idx < channel.length) {
        max = Math.max(max, Math.abs(channel[idx]));
      }
    }
    peaks.push(max);
  }
  return peaks;
}

export function getWaveformData(buffer: AudioBuffer, width: number): number[] {
  return getPeaks(buffer, width);
}

export function getFrequencyData(context: AudioContext, source: AudioNode, fftSize = 2048): AnalyserNode {
  const analyser = context.createAnalyser();
  analyser.fftSize = fftSize;
  source.connect(analyser);
  return analyser;
}

export function exportWav(buffer: AudioBuffer): Blob {
  // Simple WAV export (mono)
  const numFrames = buffer.length;
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;
  const wav = new ArrayBuffer(bufferSize);
  const view = new DataView(wav);
  let offset = 0;
  function writeString(s: string) {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
  }
  writeString('RIFF');
  view.setUint32(offset, 36 + dataSize, true); offset += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, byteRate, true); offset += 4;
  view.setUint16(offset, blockAlign, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeString('data');
  view.setUint32(offset, dataSize, true); offset += 4;
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i++) {
    let sample = Math.max(-1, Math.min(1, channel[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }
  return new Blob([wav], { type: 'audio/wav' });
}