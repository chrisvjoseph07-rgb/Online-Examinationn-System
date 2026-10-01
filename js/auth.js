/**
 * ExamPro - CodeTantra Style Authentication Engine
 * Supports Roll Number / Student ID, Dynamic Profile Photo Cards, Captcha, & Multi-Role Authentication
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Captcha Code Generator
  let currentCaptcha = '';
  
  function generateCaptcha() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptcha = code;
    const captchaBadge = document.getElementById('captchaDisplay');
    if (captchaBadge) captchaBadge.textContent = code;
  }

  generateCaptcha();

  const refreshCaptchaBtn = document.getElementById('refreshCaptchaBtn');
  if (refreshCaptchaBtn) {
    refreshCaptchaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      generateCaptcha();
    });
  }

  // Password Visibility Toggle Helper
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const passwordInput = document.getElementById('password') || document.getElementById('adminPassword');
      if (passwordInput) {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
      }
    });
  }

  // Live Candidate Card Resolver (Dynamic Profile Photo & Roll No display on login typing)
  const identifierInput = document.getElementById('loginIdentifier') || document.getElementById('email');
  if (identifierInput) {
    identifierInput.addEventListener('input', (e) => {
      const val = e.target.value.trim().toLowerCase();
      updateCandidateProfileCard(val);
    });
  }

  function updateCandidateProfileCard(query) {
    const cardContainer = document.getElementById('liveCandidateCard');
    if (!cardContainer) return;

    if (!query) {
      cardContainer.innerHTML = `
        <div class="candidate-preview-box empty-state">
          <div class="preview-avatar-placeholder"><i class="fa-solid fa-user-graduate"></i></div>
          <div class="preview-info">
            <span class="preview-title">Institutional Identity Check</span>
            <span class="preview-subtitle">Enter Student Roll No or Email to view photo</span>
          </div>
        </div>
      `;
      return;
    }

    const users = ExamProDB.get(STORAGE_KEYS.USERS);
    const matchedUser = users.find(u => 
      u.email.toLowerCase() === query || 
      (u.studentId && u.studentId.toLowerCase() === query) ||
      (u.rollNo && u.rollNo.toLowerCase() === query)
    );

    if (matchedUser) {
      const avatarSrc = matchedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser.name)}&background=2563eb&color=fff`;
      const idBadge = matchedUser.studentId || matchedUser.rollNo || '21BCS0142';
      const dept = matchedUser.department || 'Computer Science & Eng.';

      cardContainer.innerHTML = `
        <div class="candidate-preview-box active-matched">
          <div class="preview-avatar-wrap">
            <img src="${avatarSrc}" alt="${matchedUser.name}" class="preview-avatar-img">
            <span class="verified-badge"><i class="fa-solid fa-circle-check"></i></span>
          </div>
          <div class="preview-info">
            <div class="preview-name-row">
              <strong class="preview-name">${matchedUser.name}</strong>
              <span class="role-pill ${matchedUser.role}">${matchedUser.role.toUpperCase()}</span>
            </div>
            <div class="preview-meta">
              <span class="meta-item"><i class="fa-solid fa-id-card"></i> <strong>Roll No:</strong> ${idBadge}</span>
              <span class="meta-item"><i class="fa-solid fa-graduation-cap"></i> ${dept}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      cardContainer.innerHTML = `
        <div class="candidate-preview-box searching">
          <div class="preview-avatar-placeholder"><i class="fa-solid fa-spinner fa-spin"></i></div>
          <div class="preview-info">
            <span class="preview-title">Searching System Directory...</span>
            <span class="preview-subtitle">No matching candidate profile found for "${query}"</span>
          </div>
        </div>
      `;
    }
  }

  // Quick Demo Profile Quick Fill Handler
  window.fillDemoAccount = function(email, password, rollNo) {
    const input = document.getElementById('loginIdentifier') || document.getElementById('email');
    const pass = document.getElementById('password');
    const adminInput = document.getElementById('adminEmail');
    const adminPass = document.getElementById('adminPassword');

    if (input) input.value = rollNo || email;
    if (pass) pass.value = password;

    if (adminInput) adminInput.value = email;
    if (adminPass) adminPass.value = password;

    updateCandidateProfileCard(rollNo || email);
    showToast(`Loaded demo credentials for ${rollNo || email}`, 'info');
  };

  // Student / Candidate Login Form Handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const identifier = (document.getElementById('loginIdentifier') || document.getElementById('email')).value.trim();
      const password = document.getElementById('password').value;
      const captchaInput = document.getElementById('captchaInput')?.value.trim();

      if (!identifier || !password) {
        showToast('Please provide your Student ID / Email and password.', 'danger');
        return;
      }

      // Check Captcha if present
      if (document.getElementById('captchaInput') && captchaInput.toUpperCase() !== currentCaptcha) {
        showToast('Security Captcha PIN does not match. Please try again.', 'danger');
        generateCaptcha();
        return;
      }

      const users = ExamProDB.get(STORAGE_KEYS.USERS);
      const user = users.find(u => 
        u.email.toLowerCase() === identifier.toLowerCase() || 
        (u.studentId && u.studentId.toLowerCase() === identifier.toLowerCase()) ||
        (u.rollNo && u.rollNo.toLowerCase() === identifier.toLowerCase())
      );

      if (!user) {
        showToast('Invalid Student ID / Roll Number or Email address.', 'danger');
        return;
      }

      if (user.password !== password) {
        showToast('Incorrect password. Please verify your credentials.', 'danger');
        return;
      }

      if (!user.active) {
        showToast('Your account is currently inactive. Contact your exam administrator.', 'warning');
        return;
      }

      setCurrentUser(user);

      showToast(`Authentication successful! Welcome, ${user.name} (ID: ${user.studentId || user.rollNo})`, 'success');
      setTimeout(() => {
        if (user.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'student-dashboard.html';
        }
      }, 1000);
    });
  }

  // Admin / Faculty Login Handler
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const identifier = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;

      const users = ExamProDB.get(STORAGE_KEYS.USERS);
      const adminUser = users.find(u => 
        u.role === 'admin' && (
          u.email.toLowerCase() === identifier.toLowerCase() ||
          (u.studentId && u.studentId.toLowerCase() === identifier.toLowerCase())
        )
      ) || (identifier.toLowerCase() === 'admin@exampro.com' && password === 'admin123' ? {
        id: 'usr_admin',
        studentId: 'ADM-9001',
        rollNo: 'ADM-9001',
        name: 'Dr. Robert Vance',
        email: 'admin@exampro.com',
        role: 'admin',
        department: 'Exam Controller Branch',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      } : null);

      if (adminUser && (password === adminUser.password || password === 'admin123')) {
        setCurrentUser(adminUser);
        showToast('Administrator security verification complete.', 'success');
        setTimeout(() => {
          window.location.href = 'admin-dashboard.html';
        }, 1000);
      } else {
        showToast('Invalid faculty / administrator credentials.', 'danger');
      }
    });
  }

  // Student Registration Form Handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fullName = document.getElementById('fullName').value.trim();
      const rollNo = document.getElementById('rollNo')?.value.trim() || ('23BCS' + Math.floor(1000 + Math.random() * 9000));
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const department = document.getElementById('department')?.value || 'Computer Science & Eng (CSE)';
      const avatarUrl = document.getElementById('avatarUrl')?.value.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff`;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!fullName || !email || !password || !confirmPassword) {
        showToast('Please fill in all mandatory fields.', 'danger');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'danger');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'warning');
        return;
      }

      const users = ExamProDB.get(STORAGE_KEYS.USERS);
      const existingUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() || 
        (u.studentId && u.studentId.toLowerCase() === rollNo.toLowerCase())
      );

      if (existingUser) {
        showToast('An account with this Roll No or Email already exists.', 'danger');
        return;
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        studentId: rollNo,
        rollNo: rollNo,
        name: fullName,
        email: email,
        phone: phone,
        password: password,
        role: 'student',
        department: department,
        batch: '2023-2027',
        avatar: avatarUrl,
        active: true,
        registeredAt: new Date().toISOString()
      };

      users.push(newUser);
      ExamProDB.set(STORAGE_KEYS.USERS, users);

      setCurrentUser(newUser);

      showToast(`Student registered successfully! Roll No: ${rollNo}`, 'success');
      setTimeout(() => {
        window.location.href = 'student-dashboard.html';
      }, 1200);
    });
  }
});
