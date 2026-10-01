/**
 * ExamPro - Live Examination Engine & Security Module
 */

let activeExamData = null;
let activeQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let markedForReview = {};
let timerInterval = null;
let timeRemainingSeconds = 0;
let tabSwitchCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get('id');

  // Instructions Page Logic
  const instructionsContainer = document.getElementById('instructionsContainer');
  if (instructionsContainer && examId) {
    initInstructionsPage(examId);
  }

  // Exam Engine Page Logic
  const examMainContainer = document.getElementById('examMainContainer');
  if (examMainContainer && examId) {
    initLiveExam(examId);
  }

  // Result Page Logic
  const resultContainer = document.getElementById('resultContainer');
  const resultId = urlParams.get('resId');
  if (resultContainer && resultId) {
    renderResultPage(resultId);
  }

  // Review Page Logic
  const reviewContainer = document.getElementById('reviewContainer');
  if (reviewContainer && resultId) {
    renderReviewPage(resultId);
  }
});

/* ==========================================
   1. INSTRUCTIONS PAGE
   ========================================== */
function initInstructionsPage(examId) {
  const user = requireAuth(['student', 'applicant']);
  if (!user) return;

  const exams = ExamProDB.get(STORAGE_KEYS.EXAMS);
  const questions = ExamProDB.get(STORAGE_KEYS.QUESTIONS);
  const exam = exams.find(e => e.id === examId);

  if (!exam) {
    showToast('Exam not found.', 'danger');
    setTimeout(() => window.location.href = 'student-dashboard.html', 1500);
    return;
  }

  const activeState = getActiveExamState(user.id);
  const isCurrentExamActive = activeState && activeState.examId === examId && activeState.timeRemainingSeconds > 0;

  const examQuestions = questions.filter(q => exam.questionIds.includes(q.id));
  const passingMarks = Math.round((exam.passingPercentage / 100) * exam.totalMarks);

  document.getElementById('instExamTitle').innerText = exam.title;
  document.getElementById('instSubject').innerText = exam.subject;
  document.getElementById('instDuration').innerText = isCurrentExamActive 
    ? `${formatTimeLeft(activeState.timeRemainingSeconds)} Left`
    : `${exam.durationMinutes} Minutes`;
  document.getElementById('instQuestionCount').innerText = examQuestions.length;
  document.getElementById('instTotalMarks').innerText = exam.totalMarks;
  document.getElementById('instPassingMarks').innerText = `${passingMarks} (${exam.passingPercentage}%)`;
  document.getElementById('instDescription').innerText = exam.description;

  // Render Candidate Verification Box
  const verifyBox = document.getElementById('candidateVerificationBox');
  if (verifyBox) {
    const rollNo = user.studentId || user.rollNo || '21BCS0142';
    const dept = user.department || 'Computer Science & Eng (CSE)';
    const avatarSrc = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`;

    verifyBox.innerHTML = `
      <div class="candidate-verification-card">
        <div class="verify-avatar">
          <img src="${avatarSrc}" alt="${user.name}">
          <span class="cam-status-pill"><i class="fa-solid fa-video"></i> Camera Active</span>
        </div>
        <div class="verify-details">
          <div class="verify-header">
            <h4><i class="fa-solid fa-id-card-clip"></i> Verified Candidate Details</h4>
            <span class="status-badge-ok"><i class="fa-solid fa-circle-check"></i> CodeTantra Identity Lock</span>
          </div>
          <div class="verify-grid">
            <div><strong>Candidate Name:</strong> ${user.name}</div>
            <div><strong>Student Roll No:</strong> <span class="roll-badge">${rollNo}</span></div>
            <div><strong>Department:</strong> ${dept}</div>
            <div><strong>System Check:</strong> Secure Web Browser Verified</div>
          </div>
        </div>
      </div>
    `;
  }

  const startBtn = document.getElementById('startExamBtn');

  if (isCurrentExamActive) {
    startBtn.className = 'btn btn-warning btn-lg';
    startBtn.style.minWidth = '240px';
    startBtn.innerHTML = `<i class="fa-solid fa-circle-play"></i> Resume Exam (${formatTimeLeft(activeState.timeRemainingSeconds)} Left)`;
    
    startBtn.addEventListener('click', () => {
      window.location.href = `exam.html?id=${exam.id}`;
    });
  } else {
    startBtn.addEventListener('click', () => {
      showModal({
        title: 'Confirm Exam Start',
        bodyHtml: `
          <div style="text-align:center;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem; color:var(--warning); margin-bottom:1rem;"></i>
            <p><strong>Are you ready to begin the exam?</strong></p>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.5rem;">
              Once started, the timer will countdown automatically. Do not switch tabs or close the browser window.
            </p>
          </div>
        `,
        confirmText: 'Start Now',
        cancelText: 'Cancel',
        onConfirm: () => {
          // Clear any previous cached draft for clean start if starting new
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXAM_STATE);
          window.location.href = `exam.html?id=${exam.id}`;
        }
      });
    });
  }
}

/* ==========================================
   2. LIVE EXAM ENGINE & SECURITY
   ========================================== */
function initLiveExam(examId) {
  const user = requireAuth(['student', 'applicant']);
  if (!user) return;

  const exams = ExamProDB.get(STORAGE_KEYS.EXAMS);
  const questions = ExamProDB.get(STORAGE_KEYS.QUESTIONS);
  const exam = exams.find(e => e.id === examId);

  if (!exam) {
    showToast('Invalid exam session.', 'danger');
    window.location.href = 'student-dashboard.html';
    return;
  }

  activeExamData = exam;

  // Render Proctor Topbar Candidate Badge
  const candidateBadgeEl = document.getElementById('examCandidateHeaderBadge');
  if (candidateBadgeEl) {
    const rollNo = user.studentId || user.rollNo || '21BCS0142';
    const avatarSrc = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`;
    candidateBadgeEl.innerHTML = `
      <div class="exam-proctor-card">
        <img src="${avatarSrc}" alt="${user.name}" class="proctor-thumb">
        <div class="proctor-info">
          <span class="p-name">${user.name}</span>
          <span class="p-roll">ID: ${rollNo}</span>
        </div>
        <span class="live-rec-dot" title="Live Video Proctoring Active"><i class="fa-solid fa-circle"></i> LIVE</span>
      </div>
    `;
  }

  // Render Live Proctor Camera Feed Box in Exam Sidebar
  const camFeedEl = document.getElementById('liveProctorCamFeed');
  if (camFeedEl) {
    const rollNo = user.studentId || user.rollNo || '21BCS0142';
    const dept = user.department || 'Computer Science & Eng';
    const avatarSrc = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`;

    camFeedEl.innerHTML = `
      <div class="proctor-cam-card">
        <div class="cam-header">
          <span class="rec-status"><i class="fa-solid fa-circle blink-red"></i> LIVE PROCTOR FEED</span>
          <span class="fps-pill">1080p 30fps</span>
        </div>
        <div class="cam-viewport">
          <img src="${avatarSrc}" alt="${user.name}" class="cam-student-img">
          <div class="face-target-box">
            <span class="corner tl"></span>
            <span class="corner tr"></span>
            <span class="corner bl"></span>
            <span class="corner br"></span>
            <div class="scan-laser-line"></div>
          </div>
          <div class="cam-overlay-info">
            <span class="candidate-roll">Roll No: ${rollNo}</span>
          </div>
        </div>
        <div class="cam-footer">
          <div class="student-meta-line">
            <strong class="s-name">${user.name}</strong>
            <span class="s-dept">${dept}</span>
          </div>
          <div class="proctor-checklist">
            <span class="check-tag ok"><i class="fa-solid fa-face-smile"></i> Face Locked</span>
            <span class="check-tag ok"><i class="fa-solid fa-shield"></i> Security OK</span>
          </div>
        </div>
      </div>
    `;
  }

  // Retrieve draft state if user accidentally refreshed page
  const activeState = getActiveExamState(user.id);
  if (activeState && activeState.examId === examId) {
    if (activeState.timeRemainingSeconds <= 0) {
      showToast('Exam time expired! Auto-submitting now...', 'warning');
      const res = autoSubmitActiveExamState(activeState);
      setTimeout(() => {
        window.location.href = res ? `result.html?resId=${res.id}` : 'student-dashboard.html';
      }, 1500);
      return;
    }
    activeQuestions = activeState.questions;
    userAnswers = activeState.userAnswers || {};
    markedForReview = activeState.markedForReview || {};
    currentQuestionIndex = activeState.currentQuestionIndex || 0;
    timeRemainingSeconds = activeState.timeRemainingSeconds;
    tabSwitchCount = activeState.tabSwitchCount || 0;
    showToast('Restored previous exam attempt state.', 'info');
  }

  if (!activeQuestions || activeQuestions.length === 0) {
    let pool = questions.filter(q => exam.questionIds.includes(q.id));
    if (exam.randomizeQuestions) {
      pool = shuffleArray(pool);
    }
    activeQuestions = pool;
    timeRemainingSeconds = exam.durationMinutes * 60;
  }

  // Setup UI elements
  document.getElementById('examTitleDisplay').innerText = exam.title;
  
  // Setup Security Listeners
  setupSecurityControls();

  // Start Timer
  startTimer();

  // Render palette & initial question
  renderQuestionPalette();
  renderCurrentQuestion();

  // Attach Navigation Listeners
  document.getElementById('prevBtn')?.addEventListener('click', () => navigateQuestion(-1));
  document.getElementById('nextBtn')?.addEventListener('click', () => navigateQuestion(1));
  document.getElementById('markReviewBtn')?.addEventListener('click', toggleMarkForReview);
  document.getElementById('clearAnswerBtn')?.addEventListener('click', clearCurrentAnswer);
  document.getElementById('submitExamBtn')?.addEventListener('click', promptSubmitExam);
}

// Timer Logic
function startTimer() {
  const timerDisplay = document.getElementById('timerDisplay');
  const timerBox = document.getElementById('timerBox');

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemainingSeconds--;
    saveActiveExamState();
    updateTimerDisplay();

    if (timeRemainingSeconds <= 300) { // 5 minutes left warning
      timerBox?.classList.add('warning');
    }

    if (timeRemainingSeconds <= 0) {
      clearInterval(timerInterval);
      showToast('Time expired! Auto-submitting exam now...', 'warning');
      submitExam(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById('timerDisplay');
  if (!timerDisplay) return;

  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  timerDisplay.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Security Features Setup
function setupSecurityControls() {
  // Prevent Right-Click & Copy
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('copy', (e) => e.preventDefault());
  document.addEventListener('selectstart', (e) => e.preventDefault());

  // Tab Switch / Visibility Loss Detection
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && activeExamData) {
      tabSwitchCount++;
      showToast(`Warning: Tab switch detected! (Violation #${tabSwitchCount})`, 'danger');
      saveActiveExamState();
    }
  });

  // Page Unload Warn
  window.addEventListener('beforeunload', (e) => {
    saveActiveExamState();
    e.returnValue = 'Exam in progress. Your progress is saved, but are you sure you want to exit?';
  });
}

function saveActiveExamState() {
  const user = getCurrentUser();
  if (!user || !activeExamData) return;

  const state = {
    examId: activeExamData.id,
    userId: user.id,
    questions: activeQuestions,
    userAnswers: userAnswers,
    markedForReview: markedForReview,
    currentQuestionIndex: currentQuestionIndex,
    timeRemainingSeconds: timeRemainingSeconds,
    tabSwitchCount: tabSwitchCount,
    lastSavedTimestamp: Date.now()
  };

  localStorage.setItem(STORAGE_KEYS.ACTIVE_EXAM_STATE, JSON.stringify(state));
}

function getActiveExamState(userId) {
  const savedState = localStorage.getItem(STORAGE_KEYS.ACTIVE_EXAM_STATE);
  if (!savedState) return null;

  try {
    const state = JSON.parse(savedState);
    if (!userId || state.userId === userId) {
      if (state.lastSavedTimestamp) {
        const elapsed = Math.floor((Date.now() - state.lastSavedTimestamp) / 1000);
        state.timeRemainingSeconds = Math.max(0, state.timeRemainingSeconds - elapsed);
      }
      return state;
    }
  } catch (e) {
    console.error('Error parsing active exam state:', e);
  }
  return null;
}

function autoSubmitActiveExamState(state) {
  if (!state) return null;
  const exams = ExamProDB.get(STORAGE_KEYS.EXAMS);
  const exam = exams.find(e => e.id === state.examId);
  if (!exam) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXAM_STATE);
    return null;
  }

  let totalScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let attemptedCount = 0;

  const questions = state.questions || [];
  const userAnswers = state.userAnswers || {};

  questions.forEach(q => {
    const userAns = userAnswers[q.id];
    if (userAns !== undefined && userAns !== '') {
      attemptedCount++;
      const isCorrect = String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      if (isCorrect) {
        correctCount++;
        totalScore += q.marks;
      } else {
        wrongCount++;
      }
    }
  });

  const unansweredCount = questions.length - attemptedCount;
  const totalPossible = questions.reduce((acc, q) => acc + q.marks, 0);
  const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const passed = percentage >= exam.passingPercentage;

  const resultObj = {
    id: 'res_' + Date.now(),
    studentId: state.userId,
    studentName: getCurrentUser()?.name || 'Student',
    studentEmail: getCurrentUser()?.email || '',
    examId: exam.id,
    examTitle: exam.title,
    totalQuestions: questions.length,
    attemptedQuestions: attemptedCount,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    unansweredQuestions: unansweredCount,
    score: totalScore,
    totalPossibleMarks: totalPossible,
    percentage: percentage,
    passed: passed,
    tabSwitchViolations: state.tabSwitchCount || 0,
    completedAt: new Date().toISOString(),
    userAnswers: userAnswers,
    examSnapshotQuestions: questions
  };

  const results = ExamProDB.get(STORAGE_KEYS.RESULTS);
  results.push(resultObj);
  ExamProDB.set(STORAGE_KEYS.RESULTS, results);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXAM_STATE);
  return resultObj;
}

function formatTimeLeft(totalSeconds) {
  if (totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Render Question Engine
function renderCurrentQuestion() {
  const q = activeQuestions[currentQuestionIndex];
  if (!q) return;

  document.getElementById('qNumberBadge').innerText = `Question ${currentQuestionIndex + 1} of ${activeQuestions.length}`;
  document.getElementById('qMarksBadge').innerText = `${q.marks} Marks (${q.difficulty})`;
  document.getElementById('qText').innerText = q.question;

  const optionsContainer = document.getElementById('qOptionsContainer');
  optionsContainer.innerHTML = '';

  const currentAns = userAnswers[q.id] || '';

  if (q.type === 'mcq' || q.type === 'tf') {
    const opts = (q.type === 'tf') ? ['True', 'False'] : q.options;
    opts.forEach((opt, idx) => {
      const isSelected = (currentAns === opt);
      const optElement = document.createElement('label');
      optElement.className = `custom-radio ${isSelected ? 'selected' : ''}`;
      optElement.innerHTML = `
        <input type="radio" name="questionOption" value="${escapeHtml(opt)}" ${isSelected ? 'checked' : ''}>
        <div>
          <strong>${String.fromCharCode(65 + idx)}.</strong> ${escapeHtml(opt)}
        </div>
      `;
      optElement.addEventListener('click', () => {
        userAnswers[q.id] = opt;
        renderCurrentQuestion();
        renderQuestionPalette();
        saveActiveExamState();
      });
      optionsContainer.appendChild(optElement);
    });
  } else if (q.type === 'short') {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.placeholder = 'Type your short answer here...';
    input.value = currentAns;
    input.addEventListener('input', (e) => {
      userAnswers[q.id] = e.target.value.trim();
      renderQuestionPalette();
      saveActiveExamState();
    });
    optionsContainer.appendChild(input);
  } else if (q.type === 'essay') {
    const textarea = document.createElement('textarea');
    textarea.className = 'form-control';
    textarea.rows = 4;
    textarea.placeholder = 'Write your response here...';
    textarea.value = currentAns;
    textarea.addEventListener('input', (e) => {
      userAnswers[q.id] = e.target.value;
      renderQuestionPalette();
      saveActiveExamState();
    });
    optionsContainer.appendChild(textarea);
  }

  // Update Mark For Review button label
  const markBtn = document.getElementById('markReviewBtn');
  if (markedForReview[q.id]) {
    markBtn.innerHTML = `<i class="fa-solid fa-bookmark"></i> Unmark Review`;
    markBtn.className = 'btn btn-warning btn-sm';
  } else {
    markBtn.innerHTML = `<i class="fa-regular fa-bookmark"></i> Mark for Review`;
    markBtn.className = 'btn btn-outline btn-sm';
  }

  // Update Progress Bar
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== '' && userAnswers[k] !== undefined).length;
  const progressPercent = Math.round((answeredCount / activeQuestions.length) * 100);
  const progressBar = document.getElementById('examProgressBar');
  if (progressBar) progressBar.style.width = `${progressPercent}%`;

  renderQuestionPalette();
}

function renderQuestionPalette() {
  const grid = document.getElementById('paletteGrid');
  if (!grid) return;

  grid.innerHTML = '';

  activeQuestions.forEach((q, idx) => {
    const btn = document.createElement('button');
    let btnClass = 'palette-btn';

    const isCurrent = idx === currentQuestionIndex;
    const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
    const isMarked = markedForReview[q.id];

    if (isCurrent) btnClass += ' current';
    if (isAnswered && isMarked) btnClass += ' marked-answered';
    else if (isAnswered) btnClass += ' answered';
    else if (isMarked) btnClass += ' marked';

    btn.className = btnClass;
    btn.innerText = idx + 1;
    btn.addEventListener('click', () => {
      currentQuestionIndex = idx;
      renderCurrentQuestion();
    });
    grid.appendChild(btn);
  });
}

function navigateQuestion(direction) {
  const newIndex = currentQuestionIndex + direction;
  if (newIndex >= 0 && newIndex < activeQuestions.length) {
    currentQuestionIndex = newIndex;
    renderCurrentQuestion();
  }
}

function toggleMarkForReview() {
  const q = activeQuestions[currentQuestionIndex];
  if (!q) return;

  if (markedForReview[q.id]) {
    delete markedForReview[q.id];
  } else {
    markedForReview[q.id] = true;
  }
  renderCurrentQuestion();
  saveActiveExamState();
}

function clearCurrentAnswer() {
  const q = activeQuestions[currentQuestionIndex];
  if (!q) return;

  delete userAnswers[q.id];
  renderCurrentQuestion();
  saveActiveExamState();
}

function promptSubmitExam() {
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== '' && userAnswers[k] !== undefined).length;
  const unansweredCount = activeQuestions.length - answeredCount;

  showModal({
    title: 'Submit Examination',
    bodyHtml: `
      <div>
        <p>Are you sure you want to finish and submit your exam?</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem; font-size:0.9rem;">
          <li>Total Questions: <strong>${activeQuestions.length}</strong></li>
          <li>Answered Questions: <strong style="color:var(--success);">${answeredCount}</strong></li>
          <li>Unanswered Questions: <strong style="color:var(--danger);">${unansweredCount}</strong></li>
        </ul>
        <p style="font-size:0.8rem; color:var(--text-muted);">You will not be able to modify your answers after submitting.</p>
      </div>
    `,
    confirmText: 'Submit Exam',
    cancelText: 'Return to Exam',
    onConfirm: () => submitExam(false)
  });
}

function submitExam(isAuto = false) {
  clearInterval(timerInterval);
  const user = getCurrentUser();

  let totalScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let attemptedCount = 0;

  activeQuestions.forEach(q => {
    const userAns = userAnswers[q.id];
    if (userAns !== undefined && userAns !== '') {
      attemptedCount++;
      const isCorrect = String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      if (isCorrect) {
        correctCount++;
        totalScore += q.marks;
      } else {
        wrongCount++;
      }
    }
  });

  const unansweredCount = activeQuestions.length - attemptedCount;
  const totalPossible = activeQuestions.reduce((acc, q) => acc + q.marks, 0);
  const percentage = Math.round((totalScore / totalPossible) * 100);
  const passed = percentage >= activeExamData.passingPercentage;

  const resultObj = {
    id: 'res_' + Date.now(),
    studentId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    examId: activeExamData.id,
    examTitle: activeExamData.title,
    totalQuestions: activeQuestions.length,
    attemptedQuestions: attemptedCount,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    unansweredQuestions: unansweredCount,
    score: totalScore,
    totalPossibleMarks: totalPossible,
    percentage: percentage,
    passed: passed,
    tabSwitchViolations: tabSwitchCount,
    completedAt: new Date().toISOString(),
    userAnswers: userAnswers,
    examSnapshotQuestions: activeQuestions
  };

  const results = ExamProDB.get(STORAGE_KEYS.RESULTS);
  results.push(resultObj);
  ExamProDB.set(STORAGE_KEYS.RESULTS, results);

  // Clear active temp draft state
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXAM_STATE);

  showToast(isAuto ? 'Exam auto-submitted!' : 'Exam submitted successfully!', 'success');
  setTimeout(() => {
    window.location.href = `result.html?resId=${resultObj.id}`;
  }, 1000);
}

/* ==========================================
   3. RESULT PAGE RENDERER
   ========================================== */
function renderResultPage(resultId) {
  const user = requireAuth();
  if (!user) return;

  const results = ExamProDB.get(STORAGE_KEYS.RESULTS);
  const res = results.find(r => r.id === resultId);

  if (!res) {
    showToast('Result record not found.', 'danger');
    return;
  }

  document.getElementById('resStudentName').innerText = res.studentName;
  document.getElementById('resExamTitle').innerText = res.examTitle;

  // Render Candidate Student Profile Banner on Scorecard
  const resCandidateCard = document.getElementById('resultCandidateCard');
  if (resCandidateCard) {
    const rollNo = res.studentRollNo || user.studentId || user.rollNo || '21BCS0142';
    const avatarSrc = res.studentAvatar || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.studentName)}&background=2563eb&color=fff`;
    resCandidateCard.innerHTML = `
      <div class="result-candidate-identity-card">
        <img src="${avatarSrc}" alt="${res.studentName}" class="res-avatar-img">
        <div class="res-identity-details">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <strong class="res-candidate-name">${res.studentName}</strong>
            <span class="badge badge-primary" style="font-size:0.7rem;">Verified Candidate</span>
          </div>
          <div class="res-meta-line">
            <span><i class="fa-solid fa-id-card"></i> <strong>Roll No:</strong> ${rollNo}</span>
            <span><i class="fa-solid fa-calendar-check"></i> <strong>Completed:</strong> ${new Date(res.completedAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `;
  }

  const badgeCircle = document.getElementById('resBadgeCircle');
  badgeCircle.className = `result-badge-circle ${res.passed ? 'pass' : 'fail'}`;
  document.getElementById('resPercentage').innerText = `${res.percentage}%`;
  document.getElementById('resStatusText').innerText = res.passed ? 'PASSED' : 'FAILED';

  document.getElementById('resScore').innerText = `${res.score} / ${res.totalPossibleMarks}`;
  document.getElementById('resTotalQuestions').innerText = res.totalQuestions;
  document.getElementById('resAttempted').innerText = res.attemptedQuestions;
  document.getElementById('resCorrect').innerText = res.correctAnswers;
  document.getElementById('resWrong').innerText = res.wrongAnswers;
  document.getElementById('resUnanswered').innerText = res.unansweredQuestions;

  document.getElementById('reviewAnswersBtn')?.addEventListener('click', () => {
    window.location.href = `review.html?resId=${res.id}`;
  });

  document.getElementById('printResultBtn')?.addEventListener('click', () => {
    window.print();
  });
}

/* ==========================================
   4. ANSWER REVIEW PAGE RENDERER
   ========================================== */
function renderReviewPage(resultId) {
  const user = requireAuth();
  if (!user) return;

  const results = ExamProDB.get(STORAGE_KEYS.RESULTS);
  const res = results.find(r => r.id === resultId);

  if (!res) {
    showToast('Result not found.', 'danger');
    return;
  }

  document.getElementById('reviewExamTitle').innerText = res.examTitle;
  document.getElementById('reviewStudentName').innerText = res.studentName;

  const container = document.getElementById('reviewQuestionsList');
  if (!container) return;
  container.innerHTML = '';

  const questions = res.examSnapshotQuestions || ExamProDB.get(STORAGE_KEYS.QUESTIONS);

  questions.forEach((q, idx) => {
    const studentAns = res.userAnswers[q.id] || '(No Answer)';
    const isAnswered = res.userAnswers[q.id] !== undefined && res.userAnswers[q.id] !== '';
    const isCorrect = isAnswered && String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();

    let statusClass = 'unanswered';
    let statusBadge = '<span class="badge badge-warning">Unanswered</span>';

    if (isAnswered) {
      if (isCorrect) {
        statusClass = 'correct';
        statusBadge = '<span class="badge badge-success"><i class="fa-solid fa-check"></i> Correct</span>';
      } else {
        statusClass = 'incorrect';
        statusBadge = '<span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Incorrect</span>';
      }
    }

    const qCard = document.createElement('div');
    qCard.className = `review-question-card ${statusClass}`;
    qCard.innerHTML = `
      <div class="card-header">
        <div>
          <strong>Question ${idx + 1}</strong> (${q.marks} Marks)
        </div>
        ${statusBadge}
      </div>
      <h4 style="margin-bottom:1rem;">${escapeHtml(q.question)}</h4>
      
      <div style="font-size:0.95rem; margin-bottom:0.5rem;">
        <strong>Your Answer:</strong> 
        <span style="color:${isCorrect ? 'var(--success-dark)' : 'var(--danger-dark)'}; font-weight:600;">
          ${escapeHtml(studentAns)}
        </span>
      </div>

      <div style="font-size:0.95rem; margin-bottom:0.75rem;">
        <strong>Correct Answer:</strong> 
        <span style="color:var(--success-dark); font-weight:600;">${escapeHtml(q.correctAnswer)}</span>
      </div>

      ${q.explanation ? `
        <div class="explanation-box">
          <i class="fa-solid fa-lightbulb"></i> <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
        </div>
      ` : ''}
    `;
    container.appendChild(qCard);
  });
}

// Utility Helpers
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
