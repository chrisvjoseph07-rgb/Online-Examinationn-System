/**
 * ExamPro - Admin Management Module
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check Admin Access on pages requiring admin script
  const isAdminPage = document.querySelector('.admin-wrapper');
  if (isAdminPage) {
    const adminUser = requireAuth(['admin']);
    if (!adminUser) return;
  }

  // Admin Dashboard Statistics
  const adminDashContainer = document.getElementById('adminDashboardMetrics');
  if (adminDashContainer) {
    renderAdminDashboardStats();
  }

  // Question Bank Page
  const questionBankContainer = document.getElementById('questionBankContainer');
  if (questionBankContainer) {
    renderQuestionBank();
  }

  // Create Exam Page
  const createExamForm = document.getElementById('createExamForm');
  if (createExamForm) {
    initCreateExamPage();
  }

  // Manage Exams Page
  const manageExamsContainer = document.getElementById('manageExamsContainer');
  if (manageExamsContainer) {
    renderManageExams();
  }

  // Student Management Page
  const studentTableBody = document.getElementById('studentTableBody');
  if (studentTableBody) {
    renderStudentList();
  }

  // Admin Results Page
  const adminResultsBody = document.getElementById('adminResultsBody');
  if (adminResultsBody) {
    renderAdminResultsList();
  }
});

/* ==========================================
   1. ADMIN DASHBOARD STATS
   ========================================== */
function renderAdminDashboardStats() {
  const users = ExamProDB.get(STORAGE_KEYS.USERS).filter(u => u.role !== 'admin');
  const exams = ExamProDB.get(STORAGE_KEYS.EXAMS);
  const questions = ExamProDB.get(STORAGE_KEYS.QUESTIONS);
  const results = ExamProDB.get(STORAGE_KEYS.RESULTS);

  document.getElementById('statTotalStudents').innerText = users.length;
  document.getElementById('statTotalExams').innerText = exams.length;
  document.getElementById('statTotalQuestions').innerText = questions.length;
  document.getElementById('statCompletedExams').innerText = results.length;

  const avgScore = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
    : 0;
  document.getElementById('statAvgScore').innerText = `${avgScore}%`;

  // Render recent results table on dashboard
  const recentTable = document.getElementById('recentResultsTableBody');
  if (recentTable) {
    recentTable.innerHTML = '';
    const recent = [...results].reverse().slice(0, 5);

    if (recent.length === 0) {
      recentTable.innerHTML = `<tr><td colspan="6" style="text-align:center;">No exam attempts recorded yet.</td></tr>`;
    } else {
      recent.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${escapeHtml(r.studentName)}</strong></td>
          <td>${escapeHtml(r.examTitle)}</td>
          <td>${r.score} / ${r.totalPossibleMarks}</td>
          <td><strong>${r.percentage}%</strong></td>
          <td>
            <span class="badge ${r.passed ? 'badge-success' : 'badge-danger'}">
              ${r.passed ? 'PASS' : 'FAIL'}
            </span>
          </td>
          <td>${new Date(r.completedAt).toLocaleDateString()}</td>
        `;
        recentTable.appendChild(row);
      });
    }
  }
}

/* ==========================================
   2. QUESTION BANK CRUD
   ========================================== */
function renderQuestionBank() {
  const questions = ExamProDB.get(STORAGE_KEYS.QUESTIONS);
  const searchInput = document.getElementById('qbSearchInput');
  const subjectFilter = document.getElementById('qbSubjectFilter');
  const diffFilter = document.getElementById('qbDiffFilter');
  const tableBody = document.getElementById('qbTableBody');

  const filterQuestions = () => {
    const qTerm = searchInput?.value.toLowerCase() || '';
    const subjVal = subjectFilter?.value || 'all';
    const diffVal = diffFilter?.value || 'all';

    const filtered = questions.filter(q => {
      const matchSearch = q.question.toLowerCase().includes(qTerm) || q.subject.toLowerCase().includes(qTerm);
      const matchSubj = (subjVal === 'all') || (q.subject === subjVal);
      const matchDiff = (diffVal === 'all') || (q.difficulty === diffVal);
      return matchSearch && matchSubj && matchDiff;
    });

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No questions found matching criteria.</td></tr>`;
      return;
    }

    filtered.forEach((q, idx) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(q.question)}</strong></td>
        <td><span class="badge badge-info">${q.subject}</span></td>
        <td>${q.type.toUpperCase()}</td>
        <td>${q.marks}</td>
        <td>
          <span class="badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}">
            ${q.difficulty}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="openEditQuestionModal('${q.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deleteQuestion('${q.id}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  };

  searchInput?.addEventListener('input', filterQuestions);
  subjectFilter?.addEventListener('change', filterQuestions);
  diffFilter?.addEventListener('change', filterQuestions);

  filterQuestions();

  // Add Question Modal Trigger
  document.getElementById('addQuestionBtn')?.addEventListener('click', () => {
    openQuestionModal();
  });
}

function openQuestionModal(editQ = null) {
  const isEdit = !!editQ;
  const modalHtml = `
    <form id="questionForm">
      <div class="form-group">
        <label class="form-label">Question Text</label>
        <textarea id="qTextVal" class="form-control" rows="2" required>${editQ ? escapeHtml(editQ.question) : ''}</textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Subject / Category</label>
          <input type="text" id="qSubjectVal" class="form-control" value="${editQ ? escapeHtml(editQ.subject) : 'Web Development'}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Question Type</label>
          <select id="qTypeVal" class="form-control">
            <option value="mcq" ${editQ && editQ.type === 'mcq' ? 'selected' : ''}>Multiple Choice (MCQ)</option>
            <option value="tf" ${editQ && editQ.type === 'tf' ? 'selected' : ''}>True / False</option>
            <option value="short" ${editQ && editQ.type === 'short' ? 'selected' : ''}>Short Answer</option>
            <option value="essay" ${editQ && editQ.type === 'essay' ? 'selected' : ''}>Essay</option>
          </select>
        </div>
      </div>

      <div id="mcqOptionsBox" style="margin-bottom:1rem;">
        <label class="form-label">MCQ Options (Enter Options A, B, C, D)</label>
        <input type="text" id="optA" class="form-control" style="margin-bottom:0.4rem;" placeholder="Option A" value="${editQ?.options?.[0] || ''}">
        <input type="text" id="optB" class="form-control" style="margin-bottom:0.4rem;" placeholder="Option B" value="${editQ?.options?.[1] || ''}">
        <input type="text" id="optC" class="form-control" style="margin-bottom:0.4rem;" placeholder="Option C" value="${editQ?.options?.[2] || ''}">
        <input type="text" id="optD" class="form-control" placeholder="Option D" value="${editQ?.options?.[3] || ''}">
      </div>

      <div class="form-group">
        <label class="form-label">Correct Answer</label>
        <input type="text" id="qCorrectVal" class="form-control" placeholder="Type exact correct answer key" value="${editQ ? escapeHtml(editQ.correctAnswer) : ''}" required>
      </div>

      <div class="form-group">
        <label class="form-label">Explanation / Solution</label>
        <textarea id="qExpVal" class="form-control" rows="2">${editQ ? escapeHtml(editQ.explanation) : ''}</textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Marks</label>
          <input type="number" id="qMarksVal" class="form-control" value="${editQ ? editQ.marks : 4}" min="1" required>
        </div>
        <div class="form-group">
          <label class="form-label">Difficulty</label>
          <select id="qDiffVal" class="form-control">
            <option value="Easy" ${editQ && editQ.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
            <option value="Medium" ${editQ && editQ.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Hard" ${editQ && editQ.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
          </select>
        </div>
      </div>
    </form>
  `;

  showModal({
    title: isEdit ? 'Edit Question' : 'Add New Question',
    bodyHtml: modalHtml,
    confirmText: isEdit ? 'Save Changes' : 'Add Question',
    cancelText: 'Cancel',
    onConfirm: () => {
      const qText = document.getElementById('qTextVal').value.trim();
      const qSubject = document.getElementById('qSubjectVal').value.trim();
      const qType = document.getElementById('qTypeVal').value;
      const qCorrect = document.getElementById('qCorrectVal').value.trim();
      const qExp = document.getElementById('qExpVal').value.trim();
      const qMarks = parseInt(document.getElementById('qMarksVal').value) || 4;
      const qDiff = document.getElementById('qDiffVal').value;

      let options = [];
      if (qType === 'mcq') {
        const oA = document.getElementById('optA').value.trim();
        const oB = document.getElementById('optB').value.trim();
        const oC = document.getElementById('optC').value.trim();
        const oD = document.getElementById('optD').value.trim();
        options = [oA, oB, oC, oD].filter(o => o !== '');
      } else if (qType === 'tf') {
        options = ['True', 'False'];
      }

      if (!qText || !qSubject || !qCorrect) {
        showToast('Please complete required question fields.', 'danger');
        return;
      }

      const questions = ExamProDB.get(STORAGE_KEYS.QUESTIONS);

      if (isEdit) {
        const idx = questions.findIndex(q => q.id === editQ.id);
        if (idx !== -1) {
          questions[idx] = {
            ...questions[idx],
            question: qText,
            subject: qSubject,
            type: qType,
            options: options,
            correctAnswer: qCorrect,
            explanation: qExp,
            marks: qMarks,
            difficulty: qDiff
          };
        }
      } else {
        const newQ = {
          id: 'q_' + Date.now(),
          question: qText,
          subject: qSubject,
          type: qType,
          options: options,
          correctAnswer: qCorrect,
          explanation: qExp,
          marks: qMarks,
          difficulty: qDiff
        };
        questions.push(newQ);
      }

      ExamProDB.set(STORAGE_KEYS.QUESTIONS, questions);
      showToast(isEdit ? 'Question updated!' : 'Question added to Question Bank!', 'success');
      renderQuestionBank();
    }
  });
}

function openEditQuestionModal(qId) {
  const questions = ExamProDB.get(STORAGE_KEYS.QUESTIONS);
  const q = questions.find(item => item.id === qId);
  if (q) openQuestionModal(q);
}

function deleteQuestion(qId) {
  showModal({
    title: 'Delete Question',
    bodyHtml: '<p>Are you sure you want to remove this question from the bank?</p>',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: () => {
      let questions = ExamProDB.get(STORAGE_KEYS.QUESTIONS);
      questions = questions.filter(q => q.id !== qId);
      ExamProDB.set(STORAGE_KEYS.QUESTIONS, questions);
      showToast('Question deleted.', 'success');
      renderQuestionBank();
    }
  });
}

/* ==========================================
   3. CREATE EXAM PAGE
   ========================================== */
function initCreateExamPage() {
  const questions = ExamProDB.get(STORAGE_KEYS.QUESTIONS);
  const container = document.getElementById('questionSelectContainer');
  if (!container) return;

  container.innerHTML = '';
  questions.forEach((q, idx) => {
    const item = document.createElement('div');
    item.className = 'custom-checkbox';
    item.style.marginBottom = '0.5rem';
    item.innerHTML = `
      <input type="checkbox" class="q-select-checkbox" value="${q.id}" data-marks="${q.marks}">
      <div>
        <strong>Q${idx + 1}. [${q.subject}] ${escapeHtml(q.question)}</strong>
        <div style="font-size:0.8rem; color:var(--text-muted);">${q.marks} Marks | ${q.difficulty}</div>
      </div>
    `;
    container.appendChild(item);
  });

  const checkboxes = container.querySelectorAll('.q-select-checkbox');
  const updateExamMetrics = () => {
    let count = 0;
    let totalMarks = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) {
        count++;
        totalMarks += parseInt(cb.getAttribute('data-marks')) || 0;
      }
    });
    document.getElementById('createTotalQCount').innerText = count;
    document.getElementById('createTotalMarksInput').value = totalMarks;
  };

  checkboxes.forEach(cb => cb.addEventListener('change', updateExamMetrics));

  document.getElementById('createExamForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('examTitleInput').value.trim();
    const subject = document.getElementById('examSubjectInput').value.trim();
    const desc = document.getElementById('examDescInput').value.trim();
    const duration = parseInt(document.getElementById('examDurationInput').value) || 20;
    const passingPct = parseInt(document.getElementById('examPassingPctInput').value) || 60;
    const randomize = document.getElementById('examRandomizeToggle').checked;

    const selectedQIds = [];
    let totalMarks = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) {
        selectedQIds.push(cb.value);
        totalMarks += parseInt(cb.getAttribute('data-marks')) || 0;
      }
    });

    if (selectedQIds.length === 0) {
      showToast('Please select at least one question for the exam.', 'warning');
      return;
    }

    const newExam = {
      id: 'exam_' + Date.now(),
      title: title,
      subject: subject,
      description: desc,
      durationMinutes: duration,
      totalMarks: totalMarks,
      passingPercentage: passingPct,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      randomizeQuestions: randomize,
      active: true,
      questionIds: selectedQIds
    };

    const exams = ExamProDB.get(STORAGE_KEYS.EXAMS);
    exams.push(newExam);
    ExamProDB.set(STORAGE_KEYS.EXAMS, exams);

    showToast('New Exam created successfully!', 'success');
    setTimeout(() => {
      window.location.href = 'manage-exams.html';
    }, 1000);
  });
}

/* ==========================================
   4. MANAGE EXAMS PAGE
   ========================================== */
function renderManageExams() {
  const exams = ExamProDB.get(STORAGE_KEYS.EXAMS);
  const tableBody = document.getElementById('examsTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (exams.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No exams configured.</td></tr>`;
    return;
  }

  exams.forEach((ex, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${escapeHtml(ex.title)}</strong></td>
      <td><span class="badge badge-info">${ex.subject}</span></td>
      <td>${ex.questionIds.length} Qs / ${ex.durationMinutes} Mins</td>
      <td>${ex.totalMarks} Marks (${ex.passingPercentage}% Pass)</td>
      <td>
        <span class="badge ${ex.active ? 'badge-success' : 'badge-secondary'}">
          ${ex.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm ${ex.active ? 'btn-warning' : 'btn-primary'}" onclick="toggleExamActive('${ex.id}')">
          ${ex.active ? 'Deactivate' : 'Activate'}
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteExam('${ex.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function toggleExamActive(examId) {
  const exams = ExamProDB.get(STORAGE_KEYS.EXAMS);
  const ex = exams.find(e => e.id === examId);
  if (ex) {
    ex.active = !ex.active;
    ExamProDB.set(STORAGE_KEYS.EXAMS, exams);
    showToast(`Exam ${ex.active ? 'activated' : 'deactivated'}.`, 'info');
    renderManageExams();
  }
}

function deleteExam(examId) {
  showModal({
    title: 'Delete Exam',
    bodyHtml: '<p>Are you sure you want to delete this exam configuration?</p>',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: () => {
      let exams = ExamProDB.get(STORAGE_KEYS.EXAMS);
      exams = exams.filter(e => e.id !== examId);
      ExamProDB.set(STORAGE_KEYS.EXAMS, exams);
      showToast('Exam deleted.', 'success');
      renderManageExams();
    }
  });
}

/* ==========================================
   5. STUDENT MANAGEMENT PAGE
   ========================================== */
function renderStudentList() {
  const users = ExamProDB.get(STORAGE_KEYS.USERS).filter(u => u.role !== 'admin');
  const tableBody = document.getElementById('studentTableBody');
  const searchInput = document.getElementById('studentSearchInput');

  const filterStudents = () => {
    const term = searchInput?.value.toLowerCase() || '';
    const filtered = users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No students found.</td></tr>`;
      return;
    }

    filtered.forEach((u, idx) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(u.name)}</strong></td>
        <td>${escapeHtml(u.email)}</td>
        <td>${u.phone || 'N/A'}</td>
        <td>
          <span class="badge ${u.active ? 'badge-success' : 'badge-danger'}">
            ${u.active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm ${u.active ? 'btn-warning' : 'btn-primary'}" onclick="toggleUserStatus('${u.id}')">
            ${u.active ? 'Disable' : 'Enable'}
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  };

  searchInput?.addEventListener('input', filterStudents);
  filterStudents();
}

function toggleUserStatus(userId) {
  const users = ExamProDB.get(STORAGE_KEYS.USERS);
  const u = users.find(usr => usr.id === userId);
  if (u) {
    u.active = !u.active;
    ExamProDB.set(STORAGE_KEYS.USERS, users);
    showToast(`Student status updated for ${u.name}.`, 'info');
    renderStudentList();
  }
}

/* ==========================================
   6. ADMIN RESULTS MANAGEMENT PAGE
   ========================================== */
function renderAdminResultsList() {
  const results = ExamProDB.get(STORAGE_KEYS.RESULTS);
  const tableBody = document.getElementById('adminResultsBody');
  const searchInput = document.getElementById('resultsSearchInput');

  const filterResults = () => {
    const term = searchInput?.value.toLowerCase() || '';
    const filtered = results.filter(r => 
      r.studentName.toLowerCase().includes(term) || 
      r.examTitle.toLowerCase().includes(term)
    );

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No evaluation records found.</td></tr>`;
      return;
    }

    filtered.forEach((r, idx) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(r.studentName)}</strong></td>
        <td>${escapeHtml(r.examTitle)}</td>
        <td>${r.score} / ${r.totalPossibleMarks}</td>
        <td><strong>${r.percentage}%</strong></td>
        <td>
          <span class="badge ${r.passed ? 'badge-success' : 'badge-danger'}">
            ${r.passed ? 'PASS' : 'FAIL'}
          </span>
        </td>
        <td>
          <a href="review.html?resId=${r.id}" class="btn btn-sm btn-secondary"><i class="fa-solid fa-eye"></i> Details</a>
        </td>
      `;
      tableBody.appendChild(row);
    });
  };

  searchInput?.addEventListener('input', filterResults);
  filterResults();
}
