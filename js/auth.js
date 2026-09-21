/**
 * ExamPro - Authentication Module (Student & Admin)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Student Registration Handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const role = document.getElementById('role').value;

      // JS Validations
      if (!fullName || !email || !phone || !password || !confirmPassword) {
        showToast('Please fill in all required fields.', 'danger');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match. Please verify.', 'danger');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'warning');
        return;
      }

      const users = ExamProDB.get(STORAGE_KEYS.USERS);
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        showToast('An account with this email address already exists.', 'danger');
        return;
      }

      // Create new user object
      const newUser = {
        id: 'usr_' + Date.now(),
        name: fullName,
        email: email,
        phone: phone,
        password: password,
        role: role, // 'student' or 'applicant'
        active: true,
        registeredAt: new Date().toISOString()
      };

      users.push(newUser);
      ExamProDB.set(STORAGE_KEYS.USERS, users);

      // Auto login user
      setCurrentUser(newUser);

      showToast('Account created successfully! Redirecting to dashboard...', 'success');
      setTimeout(() => {
        window.location.href = 'student-dashboard.html';
      }, 1200);
    });
  }

  // Student Login Handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showToast('Please enter both email and password.', 'danger');
        return;
      }

      const users = ExamProDB.get(STORAGE_KEYS.USERS);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        showToast('No user account found with this email address.', 'danger');
        return;
      }

      if (user.password !== password) {
        showToast('Invalid password. Please try again.', 'danger');
        return;
      }

      if (!user.active) {
        showToast('Your account is currently inactive. Please contact administrator.', 'warning');
        return;
      }

      setCurrentUser(user);

      showToast(`Welcome back, ${user.name}!`, 'success');
      setTimeout(() => {
        if (user.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'student-dashboard.html';
        }
      }, 1000);
    });
  }

  // Admin Login Handler
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;

      if (email === 'admin@exampro.com' && password === 'admin123') {
        const adminUser = {
          id: 'usr_admin',
          name: 'ExamPro Administrator',
          email: 'admin@exampro.com',
          role: 'admin'
        };
        setCurrentUser(adminUser);
        showToast('Admin authentication successful!', 'success');
        setTimeout(() => {
          window.location.href = 'admin-dashboard.html';
        }, 1000);
      } else {
        showToast('Invalid administrator credentials.', 'danger');
      }
    });
  }
});
