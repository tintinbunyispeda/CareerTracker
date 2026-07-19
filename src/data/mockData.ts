import type { JobApplication, UserProfile } from '../types';

export const mockProfile: UserProfile = {
  name: 'Cristine Valentina',
  email: 'your.email@student.president.ac.id',
  phone: '+62 812-3456-7890',
  website: 'linkedin.com/in/your-profile',
  resumeName: 'cristine_cv_2026.pdf',
  resumeStatus: 'Successfully parsed CV from local database seed.',
  skills: [
    { name: 'JavaScript', confidence: 95 },
    { name: 'TypeScript', confidence: 90 },
    { name: 'Python', confidence: 90 },
    { name: 'Java', confidence: 75 },
    { name: 'SQL', confidence: 85 },
    { name: 'HTML', confidence: 95 },
    { name: 'CSS', confidence: 90 },
    { name: 'React', confidence: 90 },
    { name: 'FastAPI', confidence: 90 },
    { name: 'REST APIs', confidence: 90 },
    { name: 'PostgreSQL', confidence: 85 },
    { name: 'MySQL', confidence: 80 },
    { name: 'Supabase', confidence: 90 },
    { name: 'Machine Learning', confidence: 85 },
    { name: 'Computer Vision', confidence: 85 },
    { name: 'YOLOv8', confidence: 80 },
    { name: 'NLP', confidence: 75 },
    { name: 'Git', confidence: 90 },
    { name: 'GitHub', confidence: 90 },
    { name: 'VS Code', confidence: 95 },
    { name: 'Google Colab', confidence: 85 },
    { name: 'Vercel', confidence: 85 }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.Sc. in Informatics (Artificial Intelligence Concentration)',
      school: 'President University',
      year: 'Sep 2024 - Present'
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Internship & Career Center (ICC), President University',
      role: 'Talent Acquisition',
      duration: 'Nov 2025 - Dec 2025',
      bullets: [
        'Reviewed 1,000+ student resumes against career-readiness standards, identifying improvements in content, structure, and presentation for internship and job applications.',
        'Evaluated student projects, achievements, and experiences to assess candidate qualifications against ICC resume standards.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'CAREERTRACK',
      role: 'Project Owner & Frontend Developer',
      tech: ['React', 'TypeScript', 'FastAPI', 'Supabase'],
      description: 'Developed a responsive personal platform for tracking job applications, recruitment stages, deadlines, follow-ups, and career insights. Built and customized reusable React and TypeScript components.'
    },
    {
      id: 'proj-2',
      title: 'BRAINFOCUS AI',
      role: 'Computer Vision Developer',
      tech: ['Python', 'Computer Vision', 'Face Recognition', 'Git'],
      description: 'Developed a facial recognition prototype using collected face datasets. Integrated the computer vision workflow from Google Colab prototype into the web application.'
    },
    {
      id: 'proj-3',
      title: 'CALORIEVISION',
      role: 'Backend & Integration Developer',
      tech: ['Python', 'FastAPI', 'YOLOv8', 'React', 'TypeScript'],
      description: 'Developed backend logic to automatically aggregate calorie estimates. Integrated YOLOv8 detection outputs for Live Mode and real-time detection results.'
    },
    {
      id: 'proj-4',
      title: 'PACKWISE AI',
      role: 'ML Recommendation Developer',
      tech: ['Python', 'Machine Learning', 'Random Forest', 'XGBoost', 'Supabase'],
      description: 'Designed a packaging recommendation pipeline and trained Random Forest/XGBoost models. Evaluated recommendation models using accuracy, precision, and recall.'
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
