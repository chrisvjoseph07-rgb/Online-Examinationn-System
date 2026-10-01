/**
 * ExamPro - Core Application Utility & Storage Engine
 */

const STORAGE_KEYS = {
  USERS: 'exampro_users',
  EXAMS: 'exampro_exams',
  QUESTIONS: 'exampro_questions',
  RESULTS: 'exampro_results',
  SESSION: 'exampro_session',
  ACTIVE_EXAM_STATE: 'exampro_active_state'
};

// Default Seed Questions
const SEED_QUESTIONS = [
  // Web Development
  {
    id: 'q_web_1',
    subject: 'Web Development',
    type: 'mcq',
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Hyperlink and Text Management Language',
      'Home Tool Markup Language'
    ],
    correctAnswer: 'Hyper Text Markup Language',
    explanation: 'HTML stands for Hyper Text Markup Language, the standard markup language for documents designed to be displayed in a web browser.',
    marks: 4,
    difficulty: 'Easy'
  },
  {
    id: 'q_web_2',
    subject: 'Web Development',
    type: 'mcq',
    question: 'Which CSS property is used to control element transparency?',
    options: ['visibility', 'opacity', 'display', 'filter'],
    correctAnswer: 'opacity',
    explanation: 'The opacity property specifies the clarity or transparency of an element on a scale from 0.0 (completely transparent) to 1.0 (completely opaque).',
    marks: 4,
    difficulty: 'Easy'
  },
  {
    id: 'q_web_3',
    subject: 'Web Development',
    type: 'tf',
    question: 'JavaScript is a statically typed programming language.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'JavaScript is dynamically typed; data types are determined at runtime rather than at compile time.',
    marks: 4,
    difficulty: 'Easy'
  },
  {
    id: 'q_web_4',
    subject: 'Web Development',
    type: 'short',
    question: 'Name the HTML element used to specify a main header section of a web page.',
    options: [],
    correctAnswer: '<header>',
    explanation: 'The <header> HTML element represents introductory content, typically a group of introductory or navigational aids.',
    marks: 4,
    difficulty: 'Medium'
  },
  {
    id: 'q_web_5',
    subject: 'Web Development',
    type: 'essay',
    question: 'Briefly explain the difference between localStorage and sessionStorage.',
    options: [],
    correctAnswer: 'localStorage persists across browser sessions while sessionStorage expires when the browser tab is closed.',
    explanation: 'localStorage retains data until explicitly deleted, whereas sessionStorage clears data as soon as the top-level tab/window closes.',
    marks: 4,
    difficulty: 'Medium'
  },

  // Python Programming
  {
    id: 'q_py_1',
    subject: 'Python Programming',
    type: 'mcq',
    question: 'Which of the following is an immutable data type in Python?',
    options: ['List', 'Dictionary', 'Tuple', 'Set'],
    correctAnswer: 'Tuple',
    explanation: 'Tuples in Python are immutable, meaning their items cannot be modified or re-assigned once created.',
    marks: 5,
    difficulty: 'Medium'
  },
  {
    id: 'q_py_2',
    subject: 'Python Programming',
    type: 'mcq',
    question: 'What is the output of `len([1, 2, 3])` in Python?',
    options: ['2', '3', '4', 'Error'],
    correctAnswer: '3',
    explanation: 'The len() function returns the number of items in an iterable object like a list.',
    marks: 5,
    difficulty: 'Easy'
  },
  {
    id: 'q_py_3',
    subject: 'Python Programming',
    type: 'tf',
    question: 'Python uses indentation to define code blocks instead of curly braces.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Whitespace indentation is mandatory in Python to delineate function blocks, loops, and conditionals.',
    marks: 5,
    difficulty: 'Easy'
  },
  {
    id: 'q_py_4',
    subject: 'Python Programming',
    type: 'mcq',
    question: 'Which keyword is used to create a function in Python?',
    options: ['func', 'def', 'function', 'create'],
    correctAnswer: 'def',
    explanation: 'The `def` keyword introduces a function definition in Python.',
    marks: 5,
    difficulty: 'Easy'
  },
  {
    id: 'q_py_5',
    subject: 'Python Programming',
    type: 'short',
    question: 'What method adds an item to the end of a list in Python?',
    options: [],
    correctAnswer: 'append',
    explanation: 'The `list.append(x)` method appends an item to the end of the list.',
    marks: 5,
    difficulty: 'Medium'
  },

  // Data Structures
  {
    id: 'q_dsa_1',
    subject: 'Data Structures',
    type: 'mcq',
    question: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correctAnswer: 'Stack',
    explanation: 'Stacks operate on a Last-In-First-Out (LIFO) basis, where the last pushed element is the first to be popped.',
    marks: 5,
    difficulty: 'Medium'
  },
  {
    id: 'q_dsa_2',
    subject: 'Data Structures',
    type: 'mcq',
    question: 'What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctAnswer: 'O(log n)',
    explanation: 'In a balanced BST, each comparison halves the search space, giving an logarithmic O(log n) time complexity.',
    marks: 5,
    difficulty: 'Hard'
  },
  {
    id: 'q_dsa_3',
    subject: 'Data Structures',
    type: 'tf',
    question: 'A Queue works on a First-In-First-Out (FIFO) basis.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Queues process elements in arrival order, adhering strictly to FIFO.',
    marks: 5,
    difficulty: 'Easy'
  },
  {
    id: 'q_dsa_4',
    subject: 'Data Structures',
    type: 'mcq',
    question: 'Which sorting algorithm has the best average-case time complexity of O(n log n)?',
    options: ['Bubble Sort', 'Quick Sort', 'Insertion Sort', 'Selection Sort'],
    correctAnswer: 'Quick Sort',
    explanation: 'Quick Sort achieves an average-case efficiency of O(n log n) using divide-and-conquer partitioning.',
    marks: 5,
    difficulty: 'Medium'
  },
  {
    id: 'q_dsa_5',
    subject: 'Data Structures',
    type: 'short',
    question: 'What data structure uses key-value pairs for fast O(1) average lookup time?',
    options: [],
    correctAnswer: 'Hash Table',
    explanation: 'Hash tables (or hash maps) map keys to values via a hashing algorithm for constant-time lookups.',
    marks: 5,
    difficulty: 'Medium'
  },

  // Computer Networks
  {
    id: 'q_net_1',
    subject: 'Computer Networks',
    type: 'mcq',
    question: 'How many layers are in the standard OSI Reference Model?',
    options: ['4', '5', '7', '9'],
    correctAnswer: '7',
    explanation: 'The OSI model consists of 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.',
    marks: 4,
    difficulty: 'Easy'
  },
  {
    id: 'q_net_2',
    subject: 'Computer Networks',
    type: 'mcq',
    question: 'Which protocol is responsible for translating domain names (e.g. example.com) to IP addresses?',
    options: ['HTTP', 'FTP', 'DNS', 'DHCP'],
    correctAnswer: 'DNS',
    explanation: 'Domain Name System (DNS) maps human-friendly domain names to numerical IP addresses.',
    marks: 4,
    difficulty: 'Easy'
  },
  {
    id: 'q_net_3',
    subject: 'Computer Networks',
    type: 'tf',
    question: 'TCP is a connectionless transport protocol.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'TCP (Transmission Control Protocol) is connection-oriented and reliable, whereas UDP is connectionless.',
    marks: 4,
    difficulty: 'Medium'
  },
  {
    id: 'q_net_4',
    subject: 'Computer Networks',
    type: 'mcq',
    question: 'What is the default port number used by secure HTTPS traffic?',
    options: ['80', '21', '443', '22'],
    correctAnswer: '443',
    explanation: 'Port 443 is the standard port reserved for HTTPS encrypted web traffic.',
    marks: 4,
    difficulty: 'Easy'
  },
  {
    id: 'q_net_5',
    subject: 'Computer Networks',
    type: 'short',
    question: 'What protocol assigns IP addresses automatically to devices on a network?',
    options: [],
    correctAnswer: 'DHCP',
    explanation: 'Dynamic Host Configuration Protocol (DHCP) dynamically provisions IP parameters to network devices.',
    marks: 4,
    difficulty: 'Medium'
  },

  // General Aptitude
  {
    id: 'q_apt_1',
    subject: 'General Aptitude',
    type: 'mcq',
    question: 'If a train runs at a speed of 60 km/hr, how many meters does it travel in 1 minute?',
    options: ['500 m', '1000 m', '1200 m', '600 m'],
    correctAnswer: '1000 m',
    explanation: '60 km/hr = (60 * 1000 m) / 60 mins = 1000 meters per minute.',
    marks: 3,
    difficulty: 'Easy'
  },
  {
    id: 'q_apt_2',
    subject: 'General Aptitude',
    type: 'mcq',
    question: 'Find the next number in the series: 2, 4, 8, 16, 32, ...',
    options: ['48', '64', '60', '72'],
    correctAnswer: '64',
    explanation: 'Each number is multiplied by 2. 32 * 2 = 64.',
    marks: 3,
    difficulty: 'Easy'
  },
  {
    id: 'q_apt_3',
    subject: 'General Aptitude',
    type: 'tf',
    question: 'The sum of angles in a flat triangle is always equal to 180 degrees.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Euclidean geometry dictates that interior angles of a triangle total 180 degrees.',
    marks: 3,
    difficulty: 'Easy'
  },
  {
    id: 'q_apt_4',
    subject: 'General Aptitude',
    type: 'mcq',
    question: 'Complete the analogy: Book is to Reading as Fork is to ...',
    options: ['Writing', 'Eating', 'Cooking', 'Drinking'],
    correctAnswer: 'Eating',
    explanation: 'A book is an instrument used for reading; a fork is an instrument used for eating.',
    marks: 3,
    difficulty: 'Easy'
  },
  {
    id: 'q_apt_5',
    subject: 'General Aptitude',
    type: 'short',
    question: 'What is 15% of 200?',
    options: [],
    correctAnswer: '30',
    explanation: '15/100 * 200 = 30.',
    marks: 3,
    difficulty: 'Easy'
  }
];

// Default Seed Exams
const SEED_EXAMS = [
  {
    id: 'exam_web_dev',
    title: 'Web Development Fundamentals',
    subject: 'Web Development',
    description: 'Test your understanding of core HTML5, CSS3, and fundamental JavaScript concepts.',
    durationMinutes: 15,
    totalMarks: 20,
    passingPercentage: 60,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    randomizeQuestions: true,
    active: true,
    questionIds: ['q_web_1', 'q_web_2', 'q_web_3', 'q_web_4', 'q_web_5']
  },
  {
    id: 'exam_python',
    title: 'Python Programming Basics',
    subject: 'Python Programming',
    description: 'Assess foundational Python logic, data types, functions, and control flow structures.',
    durationMinutes: 20,
    totalMarks: 25,
    passingPercentage: 70,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    randomizeQuestions: true,
    active: true,
    questionIds: ['q_py_1', 'q_py_2', 'q_py_3', 'q_py_4', 'q_py_5']
  },
  {
    id: 'exam_dsa',
    title: 'Data Structures & Algorithms',
    subject: 'Data Structures',
    description: 'Comprehensive quiz covering stacks, queues, binary trees, sorting, and complexity analysis.',
    durationMinutes: 30,
    totalMarks: 25,
    passingPercentage: 60,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    randomizeQuestions: true,
    active: true,
    questionIds: ['q_dsa_1', 'q_dsa_2', 'q_dsa_3', 'q_dsa_4', 'q_dsa_5']
  },
  {
    id: 'exam_networks',
    title: 'Computer Networks & Security',
    subject: 'Computer Networks',
    description: 'Evaluate OSI layers, TCP/IP, DNS, ports, and networking fundamentals.',
    durationMinutes: 20,
    totalMarks: 20,
    passingPercentage: 60,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    randomizeQuestions: false,
    active: true,
    questionIds: ['q_net_1', 'q_net_2', 'q_net_3', 'q_net_4', 'q_net_5']
  },
  {
    id: 'exam_aptitude',
    title: 'General Logical Aptitude',
    subject: 'General Aptitude',
    description: 'Speed and problem-solving assessment for numerical, spatial, and verbal logic.',
    durationMinutes: 15,
    totalMarks: 15,
    passingPercentage: 50,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    randomizeQuestions: true,
    active: true,
    questionIds: ['q_apt_1', 'q_apt_2', 'q_apt_3', 'q_apt_4', 'q_apt_5']
  }
];

// Default Seed Users (CodeTantra Style with Roll No, Profile Photo, Department)
const SEED_USERS = [
  {
    id: 'usr_admin',
    studentId: 'ADM-9001',
    rollNo: 'ADM-9001',
    name: 'Dr. Robert Vance',
    email: 'admin@exampro.com',
    phone: '+1 555 019 2831',
    password: 'admin123',
    role: 'admin',
    department: 'Exam Controller Branch',
    batch: 'Faculty / Staff',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true,
    registeredAt: '2026-01-10'
  },
  {
    id: 'usr_john',
    studentId: '21BCS0142',
    rollNo: '21BCS0142',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 555 014 9920',
    password: 'student123',
    role: 'student',
    department: 'Computer Science & Eng (CSE)',
    batch: '2021-2025',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    active: true,
    registeredAt: '2026-02-01'
  },
  {
    id: 'usr_sarah',
    studentId: '22ECE0089',
    rollNo: '22ECE0089',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phone: '+1 555 018 7741',
    password: 'student123',
    role: 'student',
    department: 'Electronics & Comm (ECE)',
    batch: '2022-2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    active: true,
    registeredAt: '2026-02-15'
  }
];

// Default Seed Sample Result
const SEED_RESULTS = [
  {
    id: 'res_sample_1',
    studentId: 'usr_john',
    studentRollNo: '21BCS0142',
    studentName: 'John Doe',
    studentEmail: 'john@example.com',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    examId: 'exam_web_dev',
    examTitle: 'Web Development Fundamentals',
    totalQuestions: 5,
    attemptedQuestions: 5,
    correctAnswers: 4,
    wrongAnswers: 1,
    unansweredQuestions: 0,
    score: 16,
    totalPossibleMarks: 20,
    percentage: 80,
    passed: true,
    completedAt: '2026-03-01T10:30:00Z',
    userAnswers: {
      'q_web_1': 'Hyper Text Markup Language',
      'q_web_2': 'opacity',
      'q_web_3': 'False',
      'q_web_4': '<header>',
      'q_web_5': 'Both are identical'
    }
  }
];

// Storage Engine
const ExamProDB = {
  init() {
    let users = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!users) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    } else {
      // Upgrade existing users if missing studentId / avatar
      const existing = JSON.parse(users);
      let updated = false;
      existing.forEach(u => {
        if (!u.studentId) {
          u.studentId = u.rollNo || (u.role === 'admin' ? 'ADM-9001' : '21BCS0142');
          u.rollNo = u.studentId;
          updated = true;
        }
        if (!u.avatar) {
          u.avatar = u.email.includes('john') ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' : 
                     (u.email.includes('sarah') ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' : 
                     'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
          updated = true;
        }
        if (!u.department) {
          u.department = u.role === 'admin' ? 'Exam Controller Branch' : 'Computer Science & Eng (CSE)';
          updated = true;
        }
      });
      if (updated) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(existing));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(SEED_EXAMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(SEED_QUESTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESULTS)) {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(SEED_RESULTS));
    }
  },

  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Initialize DB on script load
ExamProDB.init();

// Global Session Helpers
function getCurrentUser() {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  return session ? JSON.parse(session) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
}

function updateUserProfilePhoto(newAvatarUrl, callback) {
  const user = getCurrentUser();
  if (!user) return;

  user.avatar = newAvatarUrl;
  setCurrentUser(user);

  // Update in users storage list
  const users = ExamProDB.get(STORAGE_KEYS.USERS);
  const foundIdx = users.findIndex(u => u.id === user.id);
  if (foundIdx !== -1) {
    users[foundIdx].avatar = newAvatarUrl;
    ExamProDB.set(STORAGE_KEYS.USERS, users);
  }

  // Update in results storage list for past attempts
  const results = ExamProDB.get(STORAGE_KEYS.RESULTS);
  let resUpdated = false;
  results.forEach(r => {
    if (r.studentId === user.id) {
      r.studentAvatar = newAvatarUrl;
      resUpdated = true;
    }
  });
  if (resUpdated) ExamProDB.set(STORAGE_KEYS.RESULTS, results);

  renderUserHeader();
  showToast('Profile photo updated successfully!', 'success');
  if (callback) callback(newAvatarUrl);
}

function openChangePhotoModal(onSuccessCallback) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please log in to change your photo.', 'warning');
    return;
  }

  const currentAvatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`;

  showModal({
    title: 'Update Profile Photo',
    bodyHtml: `
      <div class="change-photo-modal-body" style="text-align:center;">
        <div style="margin-bottom:1.25rem;">
          <div style="position:relative; width:90px; height:90px; margin:0 auto;">
            <img id="modalPhotoPreview" src="${currentAvatar}" alt="Preview" style="width:100%; height:100%; border-radius:50%; object-fit:cover; border:3px solid var(--primary); box-shadow:var(--shadow-md);">
          </div>
          <span style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-top:0.35rem;">Current Photo Preview</span>
        </div>

        <div style="text-align:left; display:flex; flex-direction:column; gap:1rem;">
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:0.85rem;"><i class="fa-solid fa-upload"></i> Upload Image File from Computer:</label>
            <input type="file" id="modalPhotoFileInput" class="form-control" accept="image/*">
          </div>

          <div style="text-align:center; font-weight:700; font-size:0.75rem; color:var(--text-muted); position:relative;">
            <span style="background:white; padding:0 0.5rem; position:relative; z-index:1;">OR PASTE IMAGE URL</span>
            <div style="position:absolute; top:50%; left:0; right:0; height:1px; background:var(--border-light);"></div>
          </div>

          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:0.85rem;"><i class="fa-solid fa-link"></i> Web Image URL Link:</label>
            <input type="url" id="modalPhotoUrlInput" class="form-control" placeholder="https://example.com/my-photo.jpg">
          </div>

          <div style="text-align:center; font-weight:700; font-size:0.75rem; color:var(--text-muted); position:relative;">
            <span style="background:white; padding:0 0.5rem; position:relative; z-index:1;">OR PICK SAMPLE AVATAR</span>
            <div style="position:absolute; top:50%; left:0; right:0; height:1px; background:var(--border-light);"></div>
          </div>

          <div class="avatar-picker-grid" style="justify-content:center;">
            <button type="button" class="avatar-pick-btn modal-pick-preset" data-url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80" alt="Avatar 1">
            </button>
            <button type="button" class="avatar-pick-btn modal-pick-preset" data-url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Avatar 2">
            </button>
            <button type="button" class="avatar-pick-btn modal-pick-preset" data-url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar 3">
            </button>
            <button type="button" class="avatar-pick-btn modal-pick-preset" data-url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar 4">
            </button>
          </div>
        </div>
      </div>
    `,
    confirmText: 'Save New Photo',
    cancelText: 'Cancel',
    onConfirm: () => {
      const fileInput = document.getElementById('modalPhotoFileInput');
      const urlInput = document.getElementById('modalPhotoUrlInput');
      const previewImg = document.getElementById('modalPhotoPreview');

      let chosenAvatar = previewImg ? previewImg.src : null;

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          updateUserProfilePhoto(e.target.result, onSuccessCallback);
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else if (urlInput && urlInput.value.trim()) {
        updateUserProfilePhoto(urlInput.value.trim(), onSuccessCallback);
      } else if (chosenAvatar) {
        updateUserProfilePhoto(chosenAvatar, onSuccessCallback);
      }
    }
  });

  // Attach modal listeners after rendering
  setTimeout(() => {
    const fileInput = document.getElementById('modalPhotoFileInput');
    const urlInput = document.getElementById('modalPhotoUrlInput');
    const previewImg = document.getElementById('modalPhotoPreview');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const r = new FileReader();
          r.onload = (ev) => { if (previewImg) previewImg.src = ev.target.result; };
          r.readAsDataURL(e.target.files[0]);
        }
      });
    }

    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val && previewImg) previewImg.src = val;
      });
    }

    document.querySelectorAll('.modal-pick-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        if (url && previewImg) previewImg.src = url;
        if (urlInput) urlInput.value = url;
      });
    });
  }, 100);
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  window.location.href = 'login.html';
}

function requireAuth(allowedRoles = ['student', 'admin']) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'student-dashboard.html';
    }
    return null;
  }
  return user;
}

// Global UI Toast Function
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'danger') iconClass = 'fa-circle-xmark';
  if (type === 'warning') iconClass = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global Modal Function
function showModal({ title, bodyHtml, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) existingModal.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="btn btn-sm btn-secondary close-modal"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        ${bodyHtml}
      </div>
      <div class="modal-footer">
        ${cancelText ? `<button class="btn btn-secondary cancel-btn">${cancelText}</button>` : ''}
        <button class="btn btn-primary confirm-btn">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.close-modal');
  const cancelBtn = overlay.querySelector('.cancel-btn');
  const confirmBtn = overlay.querySelector('.confirm-btn');

  const closeModal = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 250);
  };

  closeBtn?.addEventListener('click', () => {
    closeModal();
    if (onCancel) onCancel();
  });
  
  cancelBtn?.addEventListener('click', () => {
    closeModal();
    if (onCancel) onCancel();
  });

  confirmBtn?.addEventListener('click', () => {
    closeModal();
    if (onConfirm) onConfirm();
  });
}

// Nav Header Update Helper with Profile Photo & ID Number
function getUserAvatarHTML(user, extraClasses = '') {
  if (!user) return `<div class="avatar-circle default ${extraClasses}">?</div>`;
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  if (user.avatar && user.avatar.startsWith('http')) {
    return `<div class="avatar-wrapper ${extraClasses}">
      <img src="${user.avatar}" alt="${user.name}" class="user-avatar-img" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff';">
      <span class="status-dot-online"></span>
    </div>`;
  }
  return `<div class="avatar-circle ${extraClasses}" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; font-weight:700;">
    ${initial}
    <span class="status-dot-online"></span>
  </div>`;
}

function renderUserHeader() {
  const user = getCurrentUser();
  const userBadgeContainer = document.getElementById('userNavBadge');
  if (!userBadgeContainer) return;

  if (user) {
    const studentIdBadge = user.studentId || user.rollNo || (user.role === 'admin' ? 'ADM-9001' : '21BCS0142');
    const avatarHtml = getUserAvatarHTML(user, 'nav-avatar');
    userBadgeContainer.innerHTML = `
      <div class="user-badge" style="display:flex; align-items:center; gap:0.75rem; background:var(--bg-surface); padding:0.35rem 0.75rem; border-radius:var(--radius-full); border:1px solid var(--border-light); shadow:var(--shadow-sm);">
        <div onclick="openChangePhotoModal()" style="cursor:pointer;" title="Click to Change Profile Photo">
          ${avatarHtml}
        </div>
        <div style="display:flex; flex-direction:column; line-height:1.2;">
          <span class="user-name" style="font-weight:700; font-size:0.88rem; color:var(--text-primary);">${user.name}</span>
          <span style="font-size:0.72rem; color:var(--primary); font-weight:600; letter-spacing:0.5px;">ID: ${studentIdBadge}</span>
        </div>
      </div>
      <button onclick="openChangePhotoModal()" class="btn btn-sm btn-secondary" style="border-radius:var(--radius-full);" title="Change Profile Photo"><i class="fa-solid fa-camera"></i> Photo</button>
      <button onclick="logoutUser()" class="btn btn-sm btn-outline" style="border-radius:var(--radius-full);"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
    `;
  } else {
    userBadgeContainer.innerHTML = `
      <a href="login.html" class="btn btn-secondary btn-sm" style="border-radius:var(--radius-full);"><i class="fa-solid fa-user-lock"></i> Student Portal</a>
      <a href="admin-login.html" class="btn btn-primary btn-sm" style="border-radius:var(--radius-full);"><i class="fa-solid fa-shield-halved"></i> Faculty Login</a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderUserHeader();
});
