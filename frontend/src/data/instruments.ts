// Instrument categorization for music generation
export interface InstrumentCategory {
  name: string;
  value: string;
  icon: string; // icon name or path
  instruments: { name: string; value: string; icon: string }[];
}

export const instrumentCategories: InstrumentCategory[] = [
  {
    name: 'Synths',
    value: 'synths',
    icon: 'synth',
    instruments: [
      { name: 'Analog Synth', value: 'analog_synth', icon: 'analog' },
      { name: 'FM Synth', value: 'fm_synth', icon: 'fm' },
      { name: 'Wavetable Synth', value: 'wavetable_synth', icon: 'wavetable' },
    ],
  },
  {
    name: 'Guitars',
    value: 'guitars',
    icon: 'guitar',
    instruments: [
      { name: 'Electric Guitar', value: 'electric_guitar', icon: 'electric' },
      { name: 'Acoustic Guitar', value: 'acoustic_guitar', icon: 'acoustic' },
      { name: 'Bass Guitar', value: 'bass_guitar', icon: 'bass' },
    ],
  },
  {
    name: 'Drums & Percussion',
    value: 'drums',
    icon: 'drum',
    instruments: [
      { name: 'Acoustic Drums', value: 'acoustic_drums', icon: 'acoustic_drum' },
      { name: 'Electronic Drums', value: 'electronic_drums', icon: 'electronic_drum' },
      { name: 'Percussion', value: 'percussion', icon: 'percussion' },
    ],
  },
  {
    name: 'Keys',
    value: 'keys',
    icon: 'piano',
    instruments: [
      { name: 'Piano', value: 'piano', icon: 'piano' },
      { name: 'Electric Piano', value: 'electric_piano', icon: 'electric_piano' },
      { name: 'Organ', value: 'organ', icon: 'organ' },
    ],
  },
  {
    name: 'Strings',
    value: 'strings',
    icon: 'strings',
    instruments: [
      { name: 'Violin', value: 'violin', icon: 'violin' },
      { name: 'Cello', value: 'cello', icon: 'cello' },
      { name: 'Double Bass', value: 'double_bass', icon: 'double_bass' },
    ],
  },
  {
    name: 'Winds',
    value: 'winds',
    icon: 'wind',
    instruments: [
      { name: 'Saxophone', value: 'saxophone', icon: 'saxophone' },
      { name: 'Flute', value: 'flute', icon: 'flute' },
      { name: 'Clarinet', value: 'clarinet', icon: 'clarinet' },
    ],
  },
];
