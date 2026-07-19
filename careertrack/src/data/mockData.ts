import type { JobApplication, UserProfile } from '../types';

export const mockProfile: UserProfile = {
  name: 'Cristine Bennett',
  email: 'cristine.bennett@example.com',
  phone: '(503) 555-0182',
  website: 'https://cristinecodes.dev',
  resumeName: 'cristine_cv_2026.pdf',
  resumeStatus: 'Uploaded and parsed successfully on July 10, 2026',
  skills: [
    'React',
    'TypeScript',
    'JavaScript',
    'CSS',
    'HTML5',
    'Git',
    'Responsive Design',
    'REST APIs',
    'Figma',
    'UI Design'
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science',
      school: 'Oregon State University',
      year: '2022 - 2025'
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Cloverfield Media',
      role: 'Junior Web Developer',
      duration: 'Nov 2025 - Present',
      bullets: [
        'Maintained and styled responsive client websites using HTML, React, and Vanilla CSS.',
        'Collaborated with designers to convert Figma visual specs into modular frontend components.',
        'Improved website loading performance by optimizing images and refactoring CSS files.'
      ]
    },
    {
      id: 'exp-2',
      company: 'Pinecone Tech',
      role: 'Frontend Engineering Intern',
      duration: 'Jun 2024 - Sep 2024',
      bullets: [
        'Fixed critical responsive layout bugs and visual defects across core web pages.',
        'Wrote utility scripts in JavaScript to automate file cleaning tasks.',
        'Participated in daily standups and code reviews with senior developer mentors.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Cozy Garden Tracker',
      role: 'Sole Developer',
      tech: ['React', 'CSS', 'JavaScript'],
      description: 'A layout-focused web application for home garden planning, allowing users to layout virtual garden beds and track watering schedules.'
    },
    {
      id: 'proj-2',
      title: 'Tea Corner Mock E-commerce',
      role: 'Frontend Lead',
      tech: ['TypeScript', 'React', 'CSS'],
      description: 'A responsive visual prototype of a boutique tea store, incorporating product filters, checkout drawer interactions, and smooth animations.'
    }
  ]
};

export const initialApplications: JobApplication[] = [
  {
    id: '1',
    company: 'Sage & Cedar Designs',
    position: 'Junior Frontend Developer',
    jobLink: 'https://sageandcedar.design/careers/junior-frontend',
    location: 'Bend, OR (Onsite preferred)',
    workType: 'Hybrid',
    dateFound: '2026-07-02',
    deadline: '2026-07-25',
    dateApplied: '2026-07-05',
    status: 'Interviewing',
    matchScore: 88,
    followUpDate: '2026-07-20',
    nextAction: 'Prepare for technical panel interview focusing on React and layout styling.',
    notes: 'A design agency focused on local craft businesses. Reached out via LinkedIn referral.',
    
    // Extended fields
    priority: 'High',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'Figma', 'GraphQL'],
    preferredSkills: ['Node.js', 'Next.js'],
    skillGaps: ['GraphQL', 'Next.js'],
    requirements: [
      '1+ years of experience writing CSS and HTML layout systems.',
      'Proficiency in React and TypeScript codebase structures.',
      'Understanding of design handoffs in Figma.'
    ],
    responsibilities: [
      'Convert design mocks into clean, interactive React screens.',
      'Maintain agency sites and add creative micro-interactions.',
      'Test website responsiveness across tablet and mobile displays.'
    ],
    benefits: ['Flexible hybrid hours', 'Acreage garden workspace', 'Health & dental coverage']
  },
  {
    id: '2',
    company: 'Meadowlands Tech',
    position: 'React UI Engineer',
    jobLink: 'https://meadowlands.io/jobs/ui-engineer',
    location: 'Remote (US)',
    workType: 'Remote',
    dateFound: '2026-07-10',
    deadline: '2026-07-30',
    dateApplied: '2026-07-12',
    status: 'Applied',
    matchScore: 92,
    followUpDate: '2026-07-24',
    nextAction: 'Check application portal and send follow-up note to recruiter on LinkedIn.',
    notes: 'Building open-source environmental tracking systems. Fully remote.',
    
    // Extended fields
    priority: 'High',
    requiredSkills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Tailwind CSS'],
    preferredSkills: ['Docker', 'Git'],
    skillGaps: ['Tailwind CSS', 'Docker'],
    requirements: [
      'Demonstrated skills building accessible (WCAG) user interfaces.',
      'Strong React components structure and hooks understanding.'
    ],
    responsibilities: [
      'Design clean dashboards representing agricultural data streams.',
      'Write reusable design-system units.'
    ],
    benefits: ['100% remote work policy', 'Learning budget', 'Four-day work week once a month']
  },
  {
    id: '3',
    company: 'Oakwood Creative',
    position: 'Web Developer',
    jobLink: 'https://oakwoodcreative.com/careers/web-dev',
    location: 'Portland, OR',
    workType: 'Onsite',
    dateFound: '2026-07-14',
    deadline: '2026-08-10',
    status: 'Wishlist',
    matchScore: 80,
    followUpDate: '2026-07-22',
    nextAction: 'Refine portfolio cases and submit application.',
    notes: 'Boutique agency working on sustainable brand identities. Found via Indeed.',
    
    // Extended fields
    priority: 'Medium',
    requiredSkills: ['HTML5', 'CSS', 'JavaScript', 'Git', 'WordPress'],
    preferredSkills: ['Figma', 'Sass'],
    skillGaps: ['WordPress', 'Sass'],
    requirements: [
      'Strong portfolio displaying visual hierarchy and responsive grids.',
      'Familiarity with layout standards and CSS variables.'
    ],
    responsibilities: [
      'Maintain brand consistency across client sites.',
      'Build lightweight animations and smooth transitions.'
    ],
    benefits: ['Eco-friendly office in SE Portland', 'Transit pass coverage', 'Weekly team lunches']
  },
  {
    id: '4',
    company: 'Earthy Labs',
    position: 'Frontend Specialist',
    jobLink: 'https://earthylabs.org/careers/frontend',
    location: 'Seattle, WA',
    workType: 'Hybrid',
    dateFound: '2026-06-20',
    deadline: '2026-07-15',
    dateApplied: '2026-06-25',
    status: 'Offer',
    matchScore: 95,
    followUpDate: '2026-07-21',
    nextAction: 'Review offer letter details, check healthcare benefits and respond.',
    notes: 'Climate science visualization startup. Received oral offer on July 14!',
    
    // Extended fields
    priority: 'High',
    requiredSkills: ['React', 'TypeScript', 'D3.js', 'CSS'],
    preferredSkills: ['Mapbox', 'GraphQL'],
    skillGaps: ['D3.js', 'Mapbox', 'GraphQL'],
    requirements: [
      'Solid foundations in React, TypeScript, and functional styling.',
      'Interest or background in rendering scientific graphs.'
    ],
    responsibilities: [
      'Design interactive geographic charts representing carbon offsets.',
      'Collaborate with backend data scientists.'
    ],
    benefits: ['Generous equity options', 'Full healthcare plans', 'Annual retreat in the Cascade range']
  },
  {
    id: '5',
    company: 'Cloverfield Analytics',
    position: 'Junior Software Engineer',
    location: 'Remote (US/Canada)',
    workType: 'Remote',
    dateFound: '2026-06-15',
    dateApplied: '2026-06-18',
    status: 'Rejected',
    matchScore: 75,
    notes: 'Data visualizer for organic farms. Standard automated rejection letter received.',
    
    // Extended fields
    priority: 'Low',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    preferredSkills: ['AWS', 'Git'],
    skillGaps: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    requirements: [
      'Basic database skills and API creation foundations.',
      'Comfortable reading server code.'
    ],
    responsibilities: [
      'Help integrate analytical dashboard components.'
    ]
  },
  {
    id: '6',
    company: 'Riverstone Media',
    position: 'Web Specialist',
    jobLink: 'https://riverstone.media/jobs',
    location: 'Eugene, OR',
    workType: 'Onsite',
    dateFound: '2026-07-08',
    deadline: '2026-07-20',
    dateApplied: '2026-07-09',
    status: 'Interviewing',
    matchScore: 84,
    followUpDate: '2026-07-19',
    nextAction: 'Complete post-interview thank you email and check on status.',
    notes: 'WordPress/React hybrid stack. Friendly small team.',
    
    // Extended fields
    priority: 'Medium',
    requiredSkills: ['HTML5', 'CSS', 'JavaScript', 'React', 'PHP'],
    preferredSkills: ['WordPress', 'Git'],
    skillGaps: ['PHP', 'WordPress'],
    requirements: [
      'Knowledge of CMS setups and headless React implementations.',
      'Strong eye for typography and margins.'
    ]
  },
  {
    id: '7',
    company: 'Pinecone Systems',
    position: 'Front End Engineer',
    location: 'Remote',
    workType: 'Remote',
    dateFound: '2026-07-11',
    status: 'Wishlist',
    matchScore: 68,
    notes: 'Hiring platform for craft workshops.',
    
    // Extended fields
    priority: 'Low',
    requiredSkills: ['React', 'Next.js', 'Tailwind CSS', 'Redux'],
    preferredSkills: ['TypeScript', 'Sass'],
    skillGaps: ['Next.js', 'Tailwind CSS', 'Redux'],
    requirements: [
      '3+ years experience with Next.js structures.',
      'Understanding of state management nodes.'
    ]
  },
  {
    id: '8',
    company: 'Harvest Financial',
    position: 'Frontend Developer',
    location: 'Portland, OR',
    workType: 'Hybrid',
    dateFound: '2026-07-05',
    deadline: '2026-07-22',
    dateApplied: '2026-07-06',
    status: 'Applied',
    matchScore: 82,
    followUpDate: '2026-07-23',
    nextAction: 'Reach out to recruiter to express continued interest.',
    notes: 'Local agricultural banking institution.',
    
    // Extended fields
    priority: 'Medium',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'Sass', 'Webpack'],
    preferredSkills: ['REST APIs'],
    skillGaps: ['Sass', 'Webpack'],
    requirements: [
      'Understanding of modular assets compilation.',
      'Familiarity with bank security requirements.'
    ]
  }
];
