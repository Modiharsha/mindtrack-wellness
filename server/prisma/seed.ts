import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MindTrack Database Seeding...');

  // Clean existing tables (in proper order for foreign keys)
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.counselorNote.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.moodEntry.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.counselorProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Dean Eleanor Vance',
      email: 'admin@mindtrack.edu',
      passwordHash,
      role: 'ADMIN',
      isApproved: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 2. Create Counselors
  const counselorUser1 = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Chen, Ph.D.',
      email: 'dr.sarah@mindtrack.edu',
      passwordHash,
      role: 'COUNSELOR',
      isApproved: true,
      avatar: 'https://images.unsplash.com/photo-1594824813633-4f934273297a?w=150&auto=format&fit=crop&q=80',
      counselorProfile: {
        create: {
          department: 'Student Health & Psychological Services',
          title: 'Clinical Director & Lead Counselor',
          bio: 'Specializing in student anxiety management, mindfulness-based cognitive strategies, and life transitions.',
          officeHours: 'Mon-Thu, 9:00 AM - 4:30 PM (Wellness Hall 302)',
          contactEmail: 'dr.sarah@mindtrack.edu',
          maxCaseload: 35,
        },
      },
    },
    include: { counselorProfile: true },
  });

  const counselorUser2 = await prisma.user.create({
    data: {
      name: 'Dr. Marcus Vance, LCSW',
      email: 'dr.marcus@mindtrack.edu',
      passwordHash,
      role: 'COUNSELOR',
      isApproved: true,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      counselorProfile: {
        create: {
          department: 'Academic Resilience & Counseling Center',
          title: 'Senior Counselor & Burnout Specialist',
          bio: 'Focused on high-achievement stress, perfectionism, first-generation college navigation, and sleep optimization.',
          officeHours: 'Tue-Fri, 10:00 AM - 5:00 PM (Student Center 114)',
          contactEmail: 'dr.marcus@mindtrack.edu',
          maxCaseload: 30,
        },
      },
    },
    include: { counselorProfile: true },
  });

  const counselor1Id = counselorUser1.counselorProfile!.id;
  const counselor2Id = counselorUser2.counselorProfile!.id;

  // 3. Create Surveys (Structured JSON)
  const wellbeingSurvey = await prisma.survey.create({
    data: {
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
  });

  const academicSurvey = await prisma.survey.create({
    data: {
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
  });

  const sleepSurvey = await prisma.survey.create({
    data: {
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
  });

  // 4. Create Recommendation Library (12 rich items)
  const recommendationsData = [
    {
      category: 'EMOTIONAL',
      title: 'Guided 4-7-8 Box Breathing for Sudden Overwhelm',
      summary: 'A fast parasympathetic reset to downregulate heart rate and clear racing thoughts.',
      content: 'Inhale through your nose for 4 seconds, gently hold your breath for 7 seconds, then exhale smoothly through your mouth for 8 seconds. Repeat 4 times to activate your vagus nerve.',
      resourceLink: 'https://mindtrack.edu/wellness/breathing-guide',
      iconType: 'heart',
      urgencyLevel: 'RECOMMENDED',
    },
    {
      category: 'ACADEMIC',
      title: 'The 25/5 Pomodoro Study Sprint Technique',
      summary: 'Break large intimidating assignments into bite-sized 25-minute focus intervals.',
      content: 'Turn off notifications, set a timer for 25 minutes, focus on one sub-task, then take a mandatory 5-minute movement break. After 4 cycles, reward yourself with 20 minutes of downtime.',
      resourceLink: 'https://mindtrack.edu/academic-support/pomodoro',
      iconType: 'book',
      urgencyLevel: 'GENERAL',
    },
    {
      category: 'ACADEMIC',
      title: 'Free Campus Peer Tutoring & Writing Center',
      summary: 'Drop-in 1-on-1 support for STEM problem sets, essay structuring, and exam prep.',
      content: 'Located on the 2nd floor of the Main Library. Free 45-minute sessions with top peer mentors. No appointment needed on weekdays 10am-4pm.',
      resourceLink: 'https://mindtrack.edu/tutoring-center',
      iconType: 'book',
      urgencyLevel: 'RECOMMENDED',
    },
    {
      category: 'SLEEP',
      title: 'Dorm Sleep Hygiene & Circadian Light Reset',
      summary: 'Small adjustments in blue light, caffeine cutoff, and bedroom temperature for restorative rest.',
      content: 'Avoid caffeine past 2:00 PM. Dim overhead lights 1 hour before bed and crack a window or use a small fan for a cool 65-68°F sleeping climate.',
      resourceLink: 'https://mindtrack.edu/sleep-hub',
      iconType: 'moon',
      urgencyLevel: 'GENERAL',
    },
    {
      category: 'EMOTIONAL',
      title: '5-4-3-2-1 Sensory Grounding Technique',
      summary: 'An emergency grounding exercise to pull you out of anxiety spiral into the present moment.',
      content: 'Name 5 things you can see around you, 4 things you can physically feel, 3 distinct sounds you hear, 2 scents you can smell, and 1 positive affirmation about yourself.',
      resourceLink: 'https://mindtrack.edu/emotional-grounding',
      iconType: 'brain',
      urgencyLevel: 'RECOMMENDED',
    },
    {
      category: 'PHYSICAL',
      title: 'Campus Recreation Center & Guided Yoga Classes',
      summary: 'Free group fitness, indoor pool, climbing wall, and restorative yoga for all skill levels.',
      content: 'Physical movement releases endorphins and reduces cortisol. Drop into free 30-minute mindfulness stretch sessions every Mon/Wed at 5:15 PM in Rec Studio B.',
      resourceLink: 'https://mindtrack.edu/recreation',
      iconType: 'activity',
      urgencyLevel: 'GENERAL',
    },
    {
      category: 'SOCIAL',
      title: 'Student Wellness Peer Circles & Coffee Hours',
      summary: 'Connect with fellow students in a casual, low-pressure weekly circle over free warm drinks.',
      content: 'Every Thursday 4-5pm at the Campus Garden Pavilion. An open space to chat about college life, shared struggles, and form genuine friendships.',
      resourceLink: 'https://mindtrack.edu/peer-circles',
      iconType: 'heart',
      urgencyLevel: 'GENERAL',
    },
    {
      category: 'CRISIS',
      title: '24/7 National Suicide & Crisis Lifeline (988)',
      summary: 'Free, confidential support available 24/7 by calling or texting 988.',
      content: 'Available 24 hours a day, 7 days a week in English and Spanish. You do not have to be in immediate danger to reach out; trained counselors will listen without judgment.',
      resourceLink: 'https://988lifeline.org',
      iconType: 'phone',
      urgencyLevel: 'URGENT',
    },
    {
      category: 'CRISIS',
      title: 'Campus Emergency On-Call Crisis Counselor',
      summary: 'Immediate urgent counselor support on campus 24/7 through campus security dispatch.',
      content: 'Call (555) 019-9111 or press any blue light emergency tower on campus for immediate dispatch of a mental health first responder.',
      resourceLink: 'tel:5550199111',
      iconType: 'phone',
      urgencyLevel: 'URGENT',
    },
    {
      category: 'CRISIS',
      title: 'Crisis Text Line: Text HOME to 741741',
      summary: 'Free 24/7 text-based crisis intervention for anxiety, panic, or loneliness.',
      content: 'Connect with a volunteer crisis counselor anytime over SMS. Free, completely confidential, and fast response times.',
      resourceLink: 'sms:741741',
      iconType: 'phone',
      urgencyLevel: 'URGENT',
    },
  ];

  for (const rec of recommendationsData) {
    await prisma.recommendation.create({ data: rec });
  }

  // 5. Create Students with Diverse Profiles and Histories

  // Student 1: Alex Rivera (Needs Attention - High Academic Strain, Low Mood Streak)
  const student1User = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.rivera@mindtrack.edu',
      passwordHash,
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      studentProfile: {
        create: {
          program: 'B.S. Computer Science',
          graduationYear: 2026,
          assignedCounselorId: counselor1Id,
          consentGiven: true,
          consentDate: new Date('2026-08-01'),
        },
      },
    },
    include: { studentProfile: true },
  });
  const student1ProfileId = student1User.studentProfile!.id;

  // Student 2: Maya Patel (Moderate - Sleep Disruption & Midterm Stress)
  const student2User = await prisma.user.create({
    data: {
      name: 'Maya Patel',
      email: 'maya.patel@mindtrack.edu',
      passwordHash,
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      studentProfile: {
        create: {
          program: 'B.S. Molecular Biology',
          graduationYear: 2027,
          assignedCounselorId: counselor1Id,
          consentGiven: true,
          consentDate: new Date('2026-08-03'),
        },
      },
    },
    include: { studentProfile: true },
  });
  const student2ProfileId = student2User.studentProfile!.id;

  // Student 3: Jordan Lee (Low Risk / Thriving - Psychology Senior)
  const student3User = await prisma.user.create({
    data: {
      name: 'Jordan Lee',
      email: 'jordan.lee@mindtrack.edu',
      passwordHash,
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      studentProfile: {
        create: {
          program: 'B.A. Psychology',
          graduationYear: 2025,
          assignedCounselorId: counselor2Id,
          consentGiven: true,
          consentDate: new Date('2026-08-02'),
        },
      },
    },
    include: { studentProfile: true },
  });
  const student3ProfileId = student3User.studentProfile!.id;

  // Student 4: Sam Taylor (Engineering Freshman - Moderate Adjustment Stress)
  const student4User = await prisma.user.create({
    data: {
      name: 'Sam Taylor',
      email: 'sam.taylor@mindtrack.edu',
      passwordHash,
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      studentProfile: {
        create: {
          program: 'B.S. Mechanical Engineering',
          graduationYear: 2028,
          assignedCounselorId: counselor2Id,
          consentGiven: true,
          consentDate: new Date('2026-08-05'),
        },
      },
    },
    include: { studentProfile: true },
  });
  const student4ProfileId = student4User.studentProfile!.id;

  // Student 5: Elena Rostova (Art Junior - Thriving / Low)
  const student5User = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.rostova@mindtrack.edu',
      passwordHash,
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      studentProfile: {
        create: {
          program: 'B.F.A. Interactive Media',
          graduationYear: 2026,
          assignedCounselorId: counselor1Id,
          consentGiven: true,
          consentDate: new Date('2026-08-06'),
        },
      },
    },
    include: { studentProfile: true },
  });
  const student5ProfileId = student5User.studentProfile!.id;

  // Helper to generate dates backwards from today
  const today = new Date();
  const getDateOffset = (offsetDays: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  // 6. Generate 20-Day Mood Histories

  // Alex Rivera: Recent drop with 4 consecutive low days (1, 1, 2, 2)
  const alexMoods = [
    { offset: 19, val: 3, tags: ['Tired'], note: 'Busy week starting' },
    { offset: 18, val: 3, tags: ['Fine'], note: 'Normal labs' },
    { offset: 17, val: 4, tags: ['Motivated'], note: 'Good group project progress' },
    { offset: 16, val: 3, tags: ['Fine'], note: '' },
    { offset: 15, val: 3, tags: ['Tired'], note: '' },
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
  ];

  for (const m of alexMoods) {
    await prisma.moodEntry.create({
      data: {
        studentId: student1ProfileId,
        moodValue: m.val,
        emotionTags: JSON.stringify(m.tags),
        note: m.note,
        entryDate: getDateOffset(m.offset),
      },
    });
  }

  // Maya Patel: Moderate fluctuation (mostly 2s and 3s)
  for (let i = 18; i >= 0; i--) {
    const val = [3, 2, 4, 3, 2, 3, 2, 3, 2, 3, 4, 3, 2, 3, 2, 3, 2, 3, 3][i] || 3;
    await prisma.moodEntry.create({
      data: {
        studentId: student2ProfileId,
        moodValue: val,
        emotionTags: JSON.stringify(val <= 2 ? ['Tired', 'Sleep Deprived'] : ['Balanced', 'Studying']),
        note: val <= 2 ? 'Late night in lab' : 'Good study session',
        entryDate: getDateOffset(i),
      },
    });
  }

  // Jordan Lee: Consistently healthy (4s and 5s)
  for (let i = 18; i >= 0; i--) {
    const val = [4, 5, 4, 4, 5, 4, 5, 4, 4, 5, 4, 5, 4, 4, 5, 4, 5, 4, 5][i] || 4;
    await prisma.moodEntry.create({
      data: {
        studentId: student3ProfileId,
        moodValue: val,
        emotionTags: JSON.stringify(['Grateful', 'Motivated', 'Calm']),
        note: 'Solid balance this week',
        entryDate: getDateOffset(i),
      },
    });
  }

  // Sam Taylor & Elena Rostova moods
  for (let i = 14; i >= 0; i--) {
    await prisma.moodEntry.create({
      data: {
        studentId: student4ProfileId,
        moodValue: [3, 2, 3, 2, 3, 3, 2, 3, 4, 3, 2, 3, 3, 2, 3][i] || 3,
        emotionTags: JSON.stringify(['Adjusting', 'Homesick']),
        note: 'Miss home but making friends',
        entryDate: getDateOffset(i),
      },
    });
    await prisma.moodEntry.create({
      data: {
        studentId: student5ProfileId,
        moodValue: [4, 4, 5, 4, 3, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4][i] || 4,
        emotionTags: JSON.stringify(['Creative', 'Relaxed']),
        note: 'Studio project coming together',
        entryDate: getDateOffset(i),
      },
    });
  }

  // 7. Seed Survey Responses & Risk Assessments

  // Alex: High score on Academic Pressure Survey & Screener
  await prisma.surveyResponse.create({
    data: {
      surveyId: academicSurvey.id,
      studentId: student1ProfileId,
      answers: JSON.stringify({ a1: 3, a2: 3, a3: 3, a4: 2, a5: 2 }),
      score: 13,
      riskLevel: 'NEEDS_ATTENTION',
      summary: 'Elevated academic stress indicators detected. Support check-in recommended.',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.riskAssessment.create({
    data: {
      studentId: student1ProfileId,
      riskLevel: 'NEEDS_ATTENTION',
      compositeScore: 78,
      primaryCategory: 'ACADEMIC',
      contributingFactors: JSON.stringify([
        'Academic Burnout Index score 13/15 (Severe range)',
        'Ongoing 4-day low mood streak (values <= 2)',
        'Frequent distress tags: Overwhelmed, Panic, Exhausted',
      ]),
      triggerSource: 'COMPOSITE',
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Maya: Moderate on Sleep Survey
  await prisma.surveyResponse.create({
    data: {
      surveyId: sleepSurvey.id,
      studentId: student2ProfileId,
      answers: JSON.stringify({ s1: 2, s2: 2, s3: 2, s4: 1 }),
      score: 7,
      riskLevel: 'MODERATE',
      summary: 'Moderate sleep deprivation and fatigue reported.',
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.riskAssessment.create({
    data: {
      studentId: student2ProfileId,
      riskLevel: 'MODERATE',
      compositeScore: 48,
      primaryCategory: 'SLEEP',
      contributingFactors: JSON.stringify([
        'Sleep Quality index: 7/12 (Moderate deprivation)',
        'Average mood 2.8/5 with recurring fatigue tags',
      ]),
      triggerSource: 'SURVEY',
      generatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Jordan: Low Risk on Wellbeing Screener
  await prisma.surveyResponse.create({
    data: {
      surveyId: wellbeingSurvey.id,
      studentId: student3ProfileId,
      answers: JSON.stringify({ q1: 0, q2: 0, q3: 1, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 }),
      score: 1,
      riskLevel: 'LOW',
      summary: 'Optimal mental vitality and healthy resilience balance.',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.riskAssessment.create({
    data: {
      studentId: student3ProfileId,
      riskLevel: 'LOW',
      compositeScore: 12,
      primaryCategory: 'EMOTIONAL',
      contributingFactors: JSON.stringify([
        'Wellbeing screener score 1/27 (Optimal baseline)',
        'Healthy 19-day positive mood check-in streak',
      ]),
      triggerSource: 'SURVEY',
      generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // 8. Seed Counselor Notes
  await prisma.counselorNote.create({
    data: {
      counselorId: counselorUser1.id,
      studentId: student1ProfileId,
      noteContent: 'Initial check-in note: Alex is taking 18 credits including Algorithms and Operating Systems. Discussed time-boxing and campus tutoring drop-in hours. Scheduled follow-up check-in.',
      isPrivate: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // 9. Seed Appointments
  await prisma.appointment.create({
    data: {
      studentId: student1ProfileId,
      counselorId: counselor1Id,
      status: 'CONFIRMED',
      requestedSlot: 'Tomorrow afternoon between 2:00 PM - 3:30 PM',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      studentNotes: 'Feeling really overwhelmed about algorithms project and midterm schedule.',
      counselorNotes: 'Confirmed 2:30 PM in Wellness Hall 302 or virtual link.',
      meetingLink: 'https://meet.mindtrack.edu/room/counselor-sarah-alex',
    },
  });

  await prisma.appointment.create({
    data: {
      studentId: student2ProfileId,
      counselorId: counselor1Id,
      status: 'REQUESTED',
      requestedSlot: 'Friday morning 10:00 AM',
      studentNotes: 'Would like some advice on managing sleep schedule with morning labs.',
    },
  });

  // 10. Seed Messages Thread between Alex and Dr. Sarah
  const msg1 = await prisma.message.create({
    data: {
      senderId: student1User.id,
      receiverId: counselorUser1.id,
      content: 'Hi Dr. Chen, I noticed the app flagged that my stress levels have been high. I am feeling pretty swamped with my coding projects this week.',
      sentAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 35 * 60 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      senderId: counselorUser1.id,
      receiverId: student1User.id,
      content: 'Hi Alex, thank you for reaching out. Junior year CS is notoriously intense, and it is completely normal to feel stretched thin. Let’s do a quick 20-minute chat to break things down into manageable pieces. I approved your slot for tomorrow at 2:30 PM!',
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      senderId: student1User.id,
      receiverId: counselorUser1.id,
      content: 'Thank you so much Dr. Chen! That really takes a weight off my chest. I will see you tomorrow at 2:30 PM.',
      sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    },
  });

  // 11. Seed In-App Notifications
  await prisma.notification.create({
    data: {
      userId: counselorUser1.id,
      title: 'Triage Alert: Alex Rivera Flagged',
      message: 'Alex Rivera has entered Needs Attention status due to 4 consecutive low mood days and elevated academic stress.',
      type: 'ALERT',
      linkUrl: `/counselor/students/${student1ProfileId}`,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: student1User.id,
      title: 'Appointment Confirmed',
      message: 'Dr. Sarah Chen confirmed your wellness check-in for tomorrow at 2:30 PM.',
      type: 'APPOINTMENT',
      linkUrl: '/student/counselor',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ MindTrack Database Seed Completed Successfully!');
  console.log('--- Default Demo Accounts ---');
  console.log('Admin:       admin@mindtrack.edu        / Password@123');
  console.log('Counselor:   dr.sarah@mindtrack.edu     / Password@123');
  console.log('Counselor:   dr.marcus@mindtrack.edu    / Password@123');
  console.log('Student 1:   alex.rivera@mindtrack.edu  / Password@123 (Needs Attention)');
  console.log('Student 2:   maya.patel@mindtrack.edu   / Password@123 (Moderate)');
  console.log('Student 3:   jordan.lee@mindtrack.edu   / Password@123 (Low / Thriving)');
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
