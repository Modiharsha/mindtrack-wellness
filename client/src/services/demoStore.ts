// Complete in-browser client store with pre-seeded demo data
// Ensures the entire web app works 100% smoothly on Vercel without requiring an active backend connection.

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'COUNSELOR' | 'ADMIN';
  isApproved: boolean;
  avatar?: string;
  studentProfile?: {
    id: string;
    program: string;
    graduationYear: number;
    assignedCounselorId?: string;
    consentGiven: boolean;
    assignedCounselor?: {
      user: { name: string; email: string };
      title: string;
      officeHours: string;
    };
  };
  counselorProfile?: {
    id: string;
    department: string;
    title: string;
    bio: string;
    officeHours: string;
    contactEmail: string;
  };
}

const INITIAL_USERS: DemoUser[] = [
  {
    id: 'user-admin-1',
    name: 'Dean Eleanor Vance',
    email: 'admin@mindtrack.edu',
    role: 'ADMIN',
    isApproved: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-counselor-1',
    name: 'Dr. Sarah Chen, Ph.D.',
    email: 'dr.sarah@mindtrack.edu',
    role: 'COUNSELOR',
    isApproved: true,
    avatar: 'https://images.unsplash.com/photo-1594824813633-4f934273297a?w=150&auto=format&fit=crop&q=80',
    counselorProfile: {
      id: 'counselor-prof-1',
      department: 'Student Health & Psychological Services',
      title: 'Clinical Director & Lead Counselor',
      bio: 'Specializing in student anxiety management, mindfulness-based cognitive strategies, and life transitions.',
      officeHours: 'Mon-Thu, 9:00 AM - 4:30 PM (Wellness Hall 302)',
      contactEmail: 'dr.sarah@mindtrack.edu',
    },
  },
  {
    id: 'user-counselor-2',
    name: 'Dr. Marcus Vance, LCSW',
    email: 'dr.marcus@mindtrack.edu',
    role: 'COUNSELOR',
    isApproved: true,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    counselorProfile: {
      id: 'counselor-prof-2',
      department: 'Academic Resilience & Counseling Center',
      title: 'Senior Counselor & Burnout Specialist',
      bio: 'Focused on high-achievement stress, perfectionism, first-generation college navigation, and sleep optimization.',
      officeHours: 'Tue-Fri, 10:00 AM - 5:00 PM (Student Center 114)',
      contactEmail: 'dr.marcus@mindtrack.edu',
    },
  },
  {
    id: 'user-student-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@mindtrack.edu',
    role: 'STUDENT',
    isApproved: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    studentProfile: {
      id: 'student-prof-1',
      program: 'B.S. Computer Science',
      graduationYear: 2026,
      assignedCounselorId: 'counselor-prof-1',
      consentGiven: true,
      assignedCounselor: {
        user: { name: 'Dr. Sarah Chen, Ph.D.', email: 'dr.sarah@mindtrack.edu' },
        title: 'Clinical Director & Lead Counselor',
        officeHours: 'Mon-Thu, 9:00 AM - 4:30 PM (Wellness Hall 302)',
      },
    },
  },
  {
    id: 'user-student-2',
    name: 'Maya Patel',
    email: 'maya.patel@mindtrack.edu',
    role: 'STUDENT',
    isApproved: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    studentProfile: {
      id: 'student-prof-2',
      program: 'B.S. Molecular Biology',
      graduationYear: 2027,
      assignedCounselorId: 'counselor-prof-1',
      consentGiven: true,
      assignedCounselor: {
        user: { name: 'Dr. Sarah Chen, Ph.D.', email: 'dr.sarah@mindtrack.edu' },
        title: 'Clinical Director & Lead Counselor',
        officeHours: 'Mon-Thu, 9:00 AM - 4:30 PM (Wellness Hall 302)',
      },
    },
  },
  {
    id: 'user-student-3',
    name: 'Jordan Lee',
    email: 'jordan.lee@mindtrack.edu',
    role: 'STUDENT',
    isApproved: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    studentProfile: {
      id: 'student-prof-3',
      program: 'B.A. Psychology',
      graduationYear: 2025,
      assignedCounselorId: 'counselor-prof-2',
      consentGiven: true,
      assignedCounselor: {
        user: { name: 'Dr. Marcus Vance, LCSW', email: 'dr.marcus@mindtrack.edu' },
        title: 'Senior Counselor & Burnout Specialist',
        officeHours: 'Tue-Fri, 10:00 AM - 5:00 PM (Student Center 114)',
      },
    },
  },
];

export const INITIAL_SURVEYS = [
  {
    id: 'survey-1',
    slug: 'general-wellbeing-screener',
    title: 'Mental Wellbeing & Vitality Screener',
    description: 'A 9-question regular check-in adapted from standard clinical screeners to evaluate emotional balance, motivation, and vitality over the past two weeks.',
    category: 'EMOTIONAL',
    estimatedMinutes: 4,
    questions: JSON.stringify([
      {
        id: 'q1',
        text: 'Little interest or pleasure in doing things you usually enjoy',
        type: 'scale',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 'q2',
        text: 'Feeling down, discouraged, or having a heavy emotional weight',
        type: 'scale',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 'q3',
        text: 'Trouble falling or staying asleep, or sleeping too much',
        type: 'scale',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 'q4',
        text: 'Feeling tired, sluggish, or having noticeably low energy',
        type: 'scale',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 'q5',
        text: 'Changes in appetite (eating significantly less or comfort overeating)',
        type: 'scale',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 'q6',
        text: 'Feeling overly critical of yourself or feeling like you let people down',
        type: 'scale',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 'q7',
        text: 'Trouble concentrating on lectures, assignments, or daily reading',
        type: 'scale',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 'q8',
        text: 'Feeling restless and fidgety, or unusually slow and drained',
        type: 'scale',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 'q9',
        text: 'Feeling overwhelmed and having difficulty navigating daily routines',
        type: 'scale',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
    ]),
    scoringRules: JSON.stringify({
      maxScore: 27,
      moderateThreshold: 10,
      needsAttentionThreshold: 15,
      interpretation: {
        low: 'Your vitality score shows a healthy baseline. Keep up your positive habits!',
        moderate: 'Mild to moderate strain detected. We suggest exploring simple calming tools or talking with your advisor.',
        needsAttention: 'Elevated emotional strain indicated. We strongly recommend scheduling a warm check-in with your counselor.',
      },
    }),
    active: true,
  },
  {
    id: 'survey-2',
    slug: 'academic-pressure-burnout',
    title: 'Academic Pressure & Burnout Index',
    description: 'Assesses current semester workload tension, exam anxiety, imposter syndrome feelings, and study-life sustainability.',
    category: 'ACADEMIC',
    estimatedMinutes: 3,
    questions: JSON.stringify([
      {
        id: 'a1',
        text: 'How manageable is your current coursework and project deadlines?',
        type: 'scale',
        options: [
          { value: 0, label: 'Completely manageable' },
          { value: 1, label: 'Mostly manageable with some late nights' },
          { value: 2, label: 'Struggling to keep up with key deadlines' },
          { value: 3, label: 'Completely drowned in unmanageable assignments' },
        ],
      },
      {
        id: 'a2',
        text: 'Do you feel intense anxiety or dread when approaching exams or graded presentations?',
        type: 'scale',
        options: [
          { value: 0, label: 'Rarely / Normal alertness' },
          { value: 1, label: 'Occasionally' },
          { value: 2, label: 'Frequently before each test' },
          { value: 3, label: 'Severe panic / physical tension' },
        ],
      },
      {
        id: 'a3',
        text: 'How often do you feel you do not belong or are not competent enough (Imposter Syndrome)?',
        type: 'scale',
        options: [
          { value: 0, label: 'Never / Rare' },
          { value: 1, label: 'Sometimes in difficult classes' },
          { value: 2, label: 'Frequently in most courses' },
          { value: 3, label: 'Constant overwhelming self-doubt' },
        ],
      },
      {
        id: 'a4',
        text: 'Are you able to take restful breaks without feeling crushing guilt about studying?',
        type: 'scale',
        options: [
          { value: 0, label: 'Yes, I balance rest effectively' },
          { value: 1, label: 'Sometimes feel a bit guilty' },
          { value: 2, label: 'Rarely able to relax without thinking of work' },
          { value: 3, label: 'Impossible — studying consumes all waking thoughts' },
        ],
      },
      {
        id: 'a5',
        text: 'Do you feel comfortable asking professors or teaching assistants for extensions or help?',
        type: 'scale',
        options: [
          { value: 0, label: 'Very comfortable and proactive' },
          { value: 1, label: 'Comfortable if necessary' },
          { value: 2, label: 'Intimidated and avoid reaching out' },
          { value: 3, label: 'Completely paralyzed to ask for help' },
        ],
      },
    ]),
    scoringRules: JSON.stringify({
      maxScore: 15,
      moderateThreshold: 7,
      needsAttentionThreshold: 11,
    }),
    active: true,
  },
  {
    id: 'survey-3',
    slug: 'sleep-physical-recharge',
    title: 'Sleep Quality & Physical Habits',
    description: 'Checks sleep latency, wakeful consistency, physical energy, and screen habits before rest.',
    category: 'SLEEP',
    estimatedMinutes: 3,
    questions: JSON.stringify([
      {
        id: 's1',
        text: 'On average, how many hours of uninterrupted sleep do you get per night?',
        type: 'scale',
        options: [
          { value: 0, label: '7-9 hours (Optimal)' },
          { value: 1, label: '6-7 hours (Fair)' },
          { value: 2, label: '4-6 hours (Deprived)' },
          { value: 3, label: 'Less than 4 hours (Severely deprived)' },
        ],
      },
      {
        id: 's2',
        text: 'How refreshed do you feel when waking up in the morning?',
        type: 'scale',
        options: [
          { value: 0, label: 'Fully refreshed and ready' },
          { value: 1, label: 'A bit groggy but fine after 30 mins' },
          { value: 2, label: 'Consistently exhausted regardless of hours' },
          { value: 3, label: 'Completely depleted and unable to focus' },
        ],
      },
      {
        id: 's3',
        text: 'Do you use screens (phone, laptop) in bed right before trying to fall asleep?',
        type: 'scale',
        options: [
          { value: 0, label: 'No, I put screens away 30+ mins before' },
          { value: 1, label: 'Briefly' },
          { value: 2, label: 'Yes, 1-2 hours scrolling in bed' },
          { value: 3, label: 'Yes, fall asleep with screen on throughout the night' },
        ],
      },
      {
        id: 's4',
        text: 'How frequently do you experience physical symptoms of stress (headaches, neck tension, upset stomach)?',
        type: 'scale',
        options: [
          { value: 0, label: 'Rarely' },
          { value: 1, label: '1-2 times a week' },
          { value: 2, label: 'Most days during peak weeks' },
          { value: 3, label: 'Chronic daily physical pain / tension' },
        ],
      },
    ]),
    scoringRules: JSON.stringify({
      maxScore: 12,
      moderateThreshold: 5,
      needsAttentionThreshold: 9,
    }),
    active: true,
  },
];

export const INITIAL_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    category: 'EMOTIONAL',
    title: 'Guided 4-7-8 Box Breathing for Sudden Overwhelm',
    summary: 'A fast parasympathetic reset to downregulate heart rate and clear racing thoughts.',
    content: 'Inhale through your nose for 4 seconds, gently hold your breath for 7 seconds, then exhale smoothly through your mouth for 8 seconds. Repeat 4 times to activate your vagus nerve.',
    resourceLink: 'https://mindtrack.edu/wellness/breathing-guide',
    iconType: 'heart',
    urgencyLevel: 'RECOMMENDED',
  },
  {
    id: 'rec-2',
    category: 'ACADEMIC',
    title: 'The 25/5 Pomodoro Study Sprint Technique',
    summary: 'Break large intimidating assignments into bite-sized 25-minute focus intervals.',
    content: 'Turn off notifications, set a timer for 25 minutes, focus on one sub-task, then take a mandatory 5-minute movement break. After 4 cycles, reward yourself with 20 minutes of downtime.',
    resourceLink: 'https://mindtrack.edu/academic-support/pomodoro',
    iconType: 'book',
    urgencyLevel: 'GENERAL',
  },
  {
    id: 'rec-3',
    category: 'ACADEMIC',
    title: 'Free Campus Peer Tutoring & Writing Center',
    summary: 'Drop-in 1-on-1 support for STEM problem sets, essay structuring, and exam prep.',
    content: 'Located on the 2nd floor of the Main Library. Free 45-minute sessions with top peer mentors. No appointment needed on weekdays 10am-4pm.',
    resourceLink: 'https://mindtrack.edu/tutoring-center',
    iconType: 'book',
    urgencyLevel: 'RECOMMENDED',
  },
  {
    id: 'rec-4',
    category: 'SLEEP',
    title: 'Dorm Sleep Hygiene & Circadian Light Reset',
    summary: 'Small adjustments in blue light, caffeine cutoff, and bedroom temperature for restorative rest.',
    content: 'Avoid caffeine past 2:00 PM. Dim overhead lights 1 hour before bed and crack a window or use a small fan for a cool 65-68°F sleeping climate.',
    resourceLink: 'https://mindtrack.edu/sleep-hub',
    iconType: 'moon',
    urgencyLevel: 'GENERAL',
  },
  {
    id: 'rec-5',
    category: 'EMOTIONAL',
    title: '5-4-3-2-1 Sensory Grounding Technique',
    summary: 'An emergency grounding exercise to pull you out of anxiety spiral into the present moment.',
    content: 'Name 5 things you can see around you, 4 things you can physically feel, 3 distinct sounds you hear, 2 scents you can smell, and 1 positive affirmation about yourself.',
    resourceLink: 'https://mindtrack.edu/emotional-grounding',
    iconType: 'brain',
    urgencyLevel: 'RECOMMENDED',
  },
  {
    id: 'rec-6',
    category: 'CRISIS',
    title: '24/7 National Suicide & Crisis Lifeline (988)',
    summary: 'Free, confidential support available 24/7 by calling or texting 988.',
    content: 'Available 24 hours a day, 7 days a week in English and Spanish. You do not have to be in immediate danger to reach out; trained counselors will listen without judgment.',
    resourceLink: 'https://988lifeline.org',
    iconType: 'phone',
    urgencyLevel: 'URGENT',
  },
];

// In-Memory / LocalStorage State Store
class DemoStore {
  private users: DemoUser[];
  private currentUserEmail: string = 'alex.rivera@mindtrack.edu';
  private moodEntries: any[];
  private surveyResponses: any[];
  private appointments: any[];
  private messages: any[];
  private counselorNotes: any[];
  private feedbackList: any[];

  constructor() {
    const storedUsers = localStorage.getItem('demo_users');
    this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;

    const today = new Date();
    const getDateOffset = (offsetDays: number): string => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsetDays);
      return d.toISOString().split('T')[0];
    };

    const alexMoods = [
      { offset: 14, val: 2, tags: ['Stressed', 'Exam'], note: 'Algorithms midterm coming up' },
      { offset: 13, val: 3, tags: ['Tired'], note: '' },
      { offset: 12, val: 2, tags: ['Overwhelmed'], note: 'So many deadlines' },
      { offset: 11, val: 3, tags: ['Fine'], note: '' },
      { offset: 10, val: 2, tags: ['Exhausted'], note: 'Up until 3am' },
      { offset: 9, val: 3, tags: ['Tired'], note: '' },
      { offset: 8, val: 2, tags: ['Anxious'], note: 'Struggling with code bug' },
      { offset: 7, val: 2, tags: ['Stressed'], note: '' },
      { offset: 6, val: 3, tags: ['Fine'], note: 'Weekend break' },
      { offset: 5, val: 2, tags: ['Overwhelmed'], note: 'Heavy workload ahead' },
      { offset: 4, val: 1, tags: ['Overwhelmed', 'Panic'], note: 'Failed practice test, feel lost' },
      { offset: 3, val: 1, tags: ['Exhausted', 'Hopeless'], note: 'Could not sleep at all' },
      { offset: 2, val: 2, tags: ['Overwhelmed'], note: 'Hard to concentrate' },
      { offset: 1, val: 1, tags: ['Exhausted', 'Can\'t sleep'], note: 'Need to talk to someone' },
      { offset: 0, val: 2, tags: ['Anxious', 'Tired'], note: 'Checking resources today' },
    ].map((m, idx) => ({
      id: `mood-${idx}`,
      studentId: 'student-prof-1',
      moodValue: m.val,
      emotionTags: m.tags,
      note: m.note,
      entryDate: getDateOffset(m.offset),
      createdAt: new Date().toISOString(),
    }));

    this.moodEntries = alexMoods;
    this.surveyResponses = [
      {
        id: 'resp-1',
        surveyId: 'survey-2',
        studentId: 'student-prof-1',
        score: 13,
        riskLevel: 'NEEDS_ATTENTION',
        summary: 'Elevated academic stress indicators detected. Support check-in recommended.',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        survey: INITIAL_SURVEYS[1],
      },
    ];

    this.appointments = [
      {
        id: 'apt-1',
        studentId: 'student-prof-1',
        counselorId: 'counselor-prof-1',
        status: 'CONFIRMED',
        requestedSlot: 'Tomorrow afternoon between 2:00 PM - 3:30 PM',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        studentNotes: 'Feeling really overwhelmed about algorithms project and midterm schedule.',
        counselorNotes: 'Confirmed 2:30 PM in Wellness Hall 302 or virtual link.',
        meetingLink: 'https://meet.mindtrack.edu/room/counselor-sarah-alex',
        student: { user: { name: 'Alex Rivera', email: 'alex.rivera@mindtrack.edu', avatar: INITIAL_USERS[3].avatar } },
        counselor: { user: { name: 'Dr. Sarah Chen, Ph.D.', email: 'dr.sarah@mindtrack.edu' }, title: 'Clinical Director' },
      },
    ];

    this.messages = [
      {
        id: 'msg-1',
        senderId: 'user-student-1',
        receiverId: 'user-counselor-1',
        content: 'Hi Dr. Chen, I noticed the app flagged that my stress levels have been high. I am feeling pretty swamped with my coding projects this week.',
        sentAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        sender: INITIAL_USERS[3],
        receiver: INITIAL_USERS[1],
      },
      {
        id: 'msg-2',
        senderId: 'user-counselor-1',
        receiverId: 'user-student-1',
        content: 'Hi Alex, thank you for reaching out. Junior year CS is notoriously intense, and it is completely normal to feel stretched thin. Let’s do a quick 20-minute chat to break things down into manageable pieces. I approved your slot for tomorrow at 2:30 PM!',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        sender: INITIAL_USERS[1],
        receiver: INITIAL_USERS[3],
      },
      {
        id: 'msg-3',
        senderId: 'user-student-1',
        receiverId: 'user-counselor-1',
        content: 'Thank you so much Dr. Chen! That really takes a weight off my chest. I will see you tomorrow at 2:30 PM.',
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        sender: INITIAL_USERS[3],
        receiver: INITIAL_USERS[1],
      },
    ];

    this.counselorNotes = [
      {
        id: 'note-1',
        counselorId: 'user-counselor-1',
        studentId: 'student-prof-1',
        noteContent: 'Initial check-in note: Alex is taking 18 credits including Algorithms and Operating Systems. Discussed time-boxing and campus tutoring drop-in hours.',
        isPrivate: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.feedbackList = [
      {
        id: 'fb-1',
        rating: 5,
        category: 'FEATURE_REQUEST',
        comment: 'The 4-7-8 breathing exercise visualizer was incredibly helpful during my finals week!',
        status: 'REVIEWED',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Alex Rivera', role: 'STUDENT' },
      },
    ];
  }

  getCurrentUser(): DemoUser {
    const user = this.users.find(u => u.email.toLowerCase() === this.currentUserEmail.toLowerCase());
    return user || this.users[3]; // default to Alex Rivera
  }

  setCurrentUserByEmail(email: string): DemoUser {
    this.currentUserEmail = email;
    return this.getCurrentUser();
  }

  login(email: string): { user: DemoUser; token: string } {
    let user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Auto-create demo student if signing in with arbitrary email
      user = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: 'STUDENT',
        isApproved: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        studentProfile: {
          id: `student-prof-${Date.now()}`,
          program: 'Undergraduate Studies',
          graduationYear: 2027,
          consentGiven: true,
          assignedCounselorId: 'counselor-prof-1',
          assignedCounselor: {
            user: { name: 'Dr. Sarah Chen, Ph.D.', email: 'dr.sarah@mindtrack.edu' },
            title: 'Clinical Director & Lead Counselor',
            officeHours: 'Mon-Thu, 9:00 AM - 4:30 PM (Wellness Hall 302)',
          },
        },
      };
      this.users.push(user);
      localStorage.setItem('demo_users', JSON.stringify(this.users));
    }
    this.currentUserEmail = user.email;
    return { user, token: `demo-token-${user.id}` };
  }

  signup(payload: any): { user: DemoUser; token: string } {
    const newUser: DemoUser = {
      id: `user-${Date.now()}`,
      name: payload.name || 'New User',
      email: payload.email,
      role: payload.role || 'STUDENT',
      isApproved: payload.role === 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      studentProfile: payload.role === 'STUDENT' ? {
        id: `student-prof-${Date.now()}`,
        program: payload.program || 'General Studies',
        graduationYear: Number(payload.graduationYear) || 2027,
        consentGiven: true,
        assignedCounselorId: 'counselor-prof-1',
        assignedCounselor: {
          user: { name: 'Dr. Sarah Chen, Ph.D.', email: 'dr.sarah@mindtrack.edu' },
          title: 'Clinical Director & Lead Counselor',
          officeHours: 'Mon-Thu, 9:00 AM - 4:30 PM (Wellness Hall 302)',
        },
      } : undefined,
    };
    this.users.push(newUser);
    localStorage.setItem('demo_users', JSON.stringify(this.users));
    this.currentUserEmail = newUser.email;
    return { user: newUser, token: `demo-token-${newUser.id}` };
  }

  logMood(payload: { moodValue: number; emotionTags?: string[]; note?: string; entryDate?: string }) {
    const dateStr = payload.entryDate || new Date().toISOString().split('T')[0];
    const newEntry = {
      id: `mood-${Date.now()}`,
      studentId: this.getCurrentUser().studentProfile?.id || 'student-prof-1',
      moodValue: payload.moodValue,
      emotionTags: payload.emotionTags || [],
      note: payload.note || '',
      entryDate: dateStr,
      createdAt: new Date().toISOString(),
    };
    this.moodEntries = [newEntry, ...this.moodEntries.filter(m => m.entryDate !== dateStr)];
    return { entry: newEntry, currentStreak: 5, riskAssessment: null };
  }

  getMoodHistory(days: number = 30) {
    const entries = this.moodEntries.slice(0, days);
    const avg = entries.length ? entries.reduce((acc, curr) => acc + curr.moodValue, 0) / entries.length : 3;
    return {
      entries,
      stats: {
        totalEntries: entries.length,
        averageMood: Number(avg.toFixed(1)),
        streak: 5,
        distribution: {
          very_low: entries.filter(e => e.moodValue === 1).length,
          low: entries.filter(e => e.moodValue === 2).length,
          neutral: entries.filter(e => e.moodValue === 3).length,
          good: entries.filter(e => e.moodValue === 4).length,
          great: entries.filter(e => e.moodValue === 5).length,
        },
        dominantEmotions: ['Stressed', 'Exhausted', 'Tired', 'Overwhelmed'],
      },
    };
  }

  submitSurvey(surveyId: string, answers: any) {
    const survey = INITIAL_SURVEYS.find(s => s.id === surveyId) || INITIAL_SURVEYS[0];
    const score = Object.values(answers).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
    const riskLevel = score >= 12 ? 'NEEDS_ATTENTION' : score >= 6 ? 'MODERATE' : 'LOW';

    const resp = {
      id: `resp-${Date.now()}`,
      surveyId,
      studentId: this.getCurrentUser().studentProfile?.id || 'student-prof-1',
      score,
      riskLevel,
      summary: riskLevel === 'NEEDS_ATTENTION' ? 'Elevated strain detected. Supportive check-in recommended.' : 'Healthy balance.',
      submittedAt: new Date().toISOString(),
      survey,
    };
    this.surveyResponses.unshift(resp);
    return { response: resp, riskLevel, score };
  }

  getAssignedStudents() {
    return [
      {
        id: 'student-prof-1',
        program: 'B.S. Computer Science',
        graduationYear: 2026,
        user: INITIAL_USERS[3],
        riskAssessments: [
          {
            id: 'risk-1',
            riskLevel: 'NEEDS_ATTENTION',
            compositeScore: 78,
            primaryCategory: 'ACADEMIC',
            contributingFactors: JSON.stringify([
              'Academic Burnout score 13/15',
              '4 consecutive low mood days',
              'Distress tags: Overwhelmed, Panic',
            ]),
            resolved: false,
          },
        ],
        moodEntries: this.moodEntries.slice(0, 7),
        surveyResponses: this.surveyResponses,
        appointments: this.appointments,
        counselorNotes: this.counselorNotes,
      },
      {
        id: 'student-prof-2',
        program: 'B.S. Molecular Biology',
        graduationYear: 2027,
        user: INITIAL_USERS[4],
        riskAssessments: [
          {
            id: 'risk-2',
            riskLevel: 'MODERATE',
            compositeScore: 48,
            primaryCategory: 'SLEEP',
            contributingFactors: JSON.stringify(['Sleep quality score 7/12', 'Fatigue tags reported']),
            resolved: false,
          },
        ],
        moodEntries: [{ moodValue: 3, entryDate: '2026-08-20' }, { moodValue: 2, entryDate: '2026-08-21' }],
        surveyResponses: [],
        appointments: [],
        counselorNotes: [],
      },
    ];
  }

  getAdminAnalytics() {
    return {
      totalStudents: 1420,
      activeCheckinsThisMonth: 1180,
      riskDistribution: {
        low: 68,
        moderate: 22,
        needsAttention: 10,
      },
      topCategories: [
        { category: 'ACADEMIC', percentage: 42 },
        { category: 'SLEEP', percentage: 28 },
        { category: 'EMOTIONAL', percentage: 20 },
        { category: 'SOCIAL', percentage: 10 },
      ],
      semesterMoodRhythm: [
        { week: 'Week 1', avgMood: 4.2 },
        { week: 'Week 2', avgMood: 4.0 },
        { week: 'Week 3', avgMood: 3.7 },
        { week: 'Week 4 (Midterms)', avgMood: 2.8 },
        { week: 'Week 5', avgMood: 3.4 },
        { week: 'Week 6', avgMood: 3.6 },
      ],
      activeSurveysCount: 3,
      totalFeedbackCount: 84,
    };
  }

  sendMessage(receiverId: string, content: string) {
    const user = this.getCurrentUser();
    const receiver = this.users.find(u => u.id === receiverId) || INITIAL_USERS[1];
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId,
      content,
      sentAt: new Date().toISOString(),
      sender: user,
      receiver,
    };
    this.messages.push(newMsg);
    return { message: newMsg };
  }

  getMessages() {
    return this.messages;
  }

  getAppointments() {
    return this.appointments;
  }

  requestAppointment(payload: any) {
    const user = this.getCurrentUser();
    const newApt = {
      id: `apt-${Date.now()}`,
      studentId: user.studentProfile?.id || 'student-prof-1',
      counselorId: payload.counselorId || 'counselor-prof-1',
      status: 'REQUESTED',
      requestedSlot: payload.requestedSlot,
      studentNotes: payload.studentNotes || '',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      student: { user: { name: user.name, email: user.email, avatar: user.avatar } },
      counselor: { user: { name: 'Dr. Sarah Chen, Ph.D.', email: 'dr.sarah@mindtrack.edu' }, title: 'Clinical Director' },
    };
    this.appointments.unshift(newApt);
    return { appointment: newApt };
  }

  getUsers() {
    return this.users;
  }
}

export const demoStore = new DemoStore();
