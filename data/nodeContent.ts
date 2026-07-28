export interface NodeContent {
  id: string;
  title: string;
  description: string;
  color: string;
  stats: { label: string; value: string }[];
  details: string[];
}

export const nodeContents: NodeContent[] = [
  {
    id: 'AI_LAB',
    title: 'AI LAB',
    description: 'Experimental space for artificial intelligence research and development. Exploring machine learning, neural networks, and intelligent systems.',
    color: '#60a5fa',
    stats: [
      { label: 'Active Projects', value: '12' },
      { label: 'Models Trained', value: '47' },
      { label: 'Accuracy Rate', value: '94.7%' },
      { label: 'Research Papers', value: '8' }
    ],
    details: [
      'Natural Language Processing',
      'Computer Vision Systems',
      'Reinforcement Learning',
      'Generative AI Models'
    ]
  },
  {
    id: 'WEB3_UNIVERSE',
    title: 'WEB3 UNIVERSE',
    description: 'Decentralized technologies and blockchain applications. Building the future of digital ownership and trustless systems.',
    color: '#a78bfa',
    stats: [
      { label: 'Smart Contracts', value: '23' },
      { label: 'TVL Managed', value: '$2.4M' },
      { label: 'Gas Optimization', value: '67%' },
      { label: 'Audit Score', value: 'A+' }
    ],
    details: [
      'DeFi Protocol Development',
      'NFT Marketplace Solutions',
      'DAO Governance Systems',
      'Cross-chain Bridges'
    ]
  },
  {
    id: 'KNOWLEDGE_ARCHIVE',
    title: 'KNOWLEDGE ARCHIVE',
    description: 'Personal knowledge management system. Organizing and connecting ideas across multiple domains and disciplines.',
    color: '#f472b6',
    stats: [
      { label: 'Notes', value: '2,847' },
      { label: 'Connections', value: '12,459' },
      { label: 'Daily Reviews', value: '45' },
      { label: 'Topics', value: '156' }
    ],
    details: [
      'Obsidian Knowledge Base',
      'Zettelkasten Method',
      'Spaced Repetition System',
      'Cross-disciplinary Links'
    ]
  },
  {
    id: 'EXPLORER',
    title: 'EXPLORER',
    description: 'Curiosity-driven exploration of emerging technologies, scientific discoveries, and creative possibilities.',
    color: '#fbbf24',
    stats: [
      { label: 'Articles Read', value: '1,234' },
      { label: 'Experiments', value: '89' },
      { label: 'Domains Explored', value: '42' },
      { label: 'Insights Gained', value: '567' }
    ],
    details: [
      'Quantum Computing Research',
      'Biotechnology Innovations',
      'Space Exploration Tech',
      'Creative Computing'
    ]
  }
];