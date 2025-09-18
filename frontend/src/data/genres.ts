// Hierarchical genre taxonomy for music generation
export interface GenreNode {
  name: string;
  value: string;
  children?: GenreNode[];
  popular?: boolean;
}

export const genres: GenreNode[] = [
  {
    name: 'Electronic',
    value: 'electronic',
    children: [
      {
        name: 'House',
        value: 'house',
        children: [
          { name: 'Deep House', value: 'deep_house' },
          { name: 'Tech House', value: 'tech_house' },
          { name: 'Progressive House', value: 'progressive_house' },
        ],
      },
    ],
    popular: true,
  },
  {
    name: 'Rock',
    value: 'rock',
    children: [
      {
        name: 'Alternative',
        value: 'alternative',
        children: [
          { name: 'Indie Rock', value: 'indie_rock' },
          { name: 'Post Rock', value: 'post_rock' },
          { name: 'Math Rock', value: 'math_rock' },
        ],
      },
    ],
    popular: true,
  },
  {
    name: 'Hip Hop',
    value: 'hip_hop',
    children: [
      { name: 'Trap', value: 'trap' },
      { name: 'Boom Bap', value: 'boom_bap' },
      { name: 'Lo-fi Hip Hop', value: 'lofi_hip_hop' },
    ],
    popular: true,
  },
  {
    name: 'Jazz',
    value: 'jazz',
    children: [
      { name: 'Smooth Jazz', value: 'smooth_jazz' },
      { name: 'Bebop', value: 'bebop' },
      { name: 'Fusion', value: 'fusion' },
    ],
  },
  {
    name: 'Classical',
    value: 'classical',
    children: [
      { name: 'Baroque', value: 'baroque' },
      { name: 'Romantic', value: 'romantic' },
      { name: 'Contemporary', value: 'contemporary' },
    ],
  },
];
