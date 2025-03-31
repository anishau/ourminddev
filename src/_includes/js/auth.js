export function AuthUI({ container }) {
  // Create the auth form HTML
  container.innerHTML = `
    <div class="auth-form" id="signInForm">
      <h2>Sign In</h2>
      <div class="social-auth">
        <button type="button" id="googleSignIn" class="google-button">
          <img src="https://www.google.com/favicon.ico" alt="Google" width="18" height="18">
          Continue with Google
        </button>
      </div>
      <div class="divider">
        <span>or</span>
      </div>
      <form id="loginForm">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required>
        </div>
        <button type="submit">Sign In</button>
      </form>
      <p>Don't have an account? <a href="#" id="showSignUp">Sign Up</a></p>
      <p><a href="#" id="showForgotPassword">Forgot Password?</a></p>
    </div>

    <div class="auth-form hidden" id="signUpForm">
      <h2>Sign Up</h2>
      <form id="registerForm">
        <div class="form-group">
          <label for="registerEmail">Email</label>
          <input type="email" id="registerEmail" name="email" required>
        </div>
        <div class="form-group">
          <label for="registerPassword">Password</label>
          <input type="password" id="registerPassword" name="password" required>
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="#" id="showSignIn">Sign In</a></p>
    </div>

    <div class="auth-form hidden" id="forgotPasswordForm">
      <h2>Reset Password</h2>
      <form id="resetForm">
        <div class="form-group">
          <label for="resetEmail">Email</label>
          <input type="email" id="resetEmail" name="email" required>
        </div>
        <button type="submit">Send Reset Link</button>
      </form>
      <p><a href="#" id="backToSignIn">Back to Sign In</a></p>
    </div>
  `

  const signInForm = container.querySelector('#signInForm')
  const signUpForm = container.querySelector('#signUpForm')
  const forgotPasswordForm = container.querySelector('#forgotPasswordForm')
  const showSignUpLink = container.querySelector('#showSignUp')
  const showSignInLink = container.querySelector('#showSignIn')
  const showForgotPasswordLink = container.querySelector('#showForgotPassword')
  const backToSignInLink = container.querySelector('#backToSignIn')

  // Toggle between forms
  showSignUpLink.addEventListener('click', (e) => {
    e.preventDefault()
    signInForm.classList.add('hidden')
    signUpForm.classList.remove('hidden')
    forgotPasswordForm.classList.add('hidden')
  })

  showSignInLink.addEventListener('click', (e) => {
    e.preventDefault()
    signUpForm.classList.add('hidden')
    signInForm.classList.remove('hidden')
    forgotPasswordForm.classList.add('hidden')
  })

  showForgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault()
    signInForm.classList.add('hidden')
    signUpForm.classList.add('hidden')
    forgotPasswordForm.classList.remove('hidden')
  })

  backToSignInLink.addEventListener('click', (e) => {
    e.preventDefault()
    forgotPasswordForm.classList.add('hidden')
    signInForm.classList.remove('hidden')
  })

  // Handle Sign In
  container.querySelector('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = container.querySelector('#email').value
    const password = container.querySelector('#password').value

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) {
            console.error('Sign in error:', error)
            alert(error.message)
            return
        }
        console.log('Signed in:', data)
        // Hide modal and redirect
        const modal = document.getElementById('authModal')
        if (modal) modal.classList.add('hidden')
        window.location.href = '/hearing-voices'
    } catch (error) {
        console.error('Error signing in:', error)
        alert(error.message)
    }
  })

  // Handle Sign Up
  container.querySelector('#registerForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = container.querySelector('#registerEmail').value
    const password = container.querySelector('#registerPassword').value

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin + '/hearing-voices'
            }
        })
        if (error) throw error
        console.log('Signed up:', data)
        // Show success message and redirect
        alert('Please check your email to confirm your account')
        window.location.href = '/hearing-voices'
    } catch (error) {
        console.error('Error signing up:', error.message)
        alert(error.message)
    }
  })

  // Add this after the form event listeners
  container.querySelector('#googleSignIn').addEventListener('click', async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/hearing-voices'
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error.message)
    }
  })

  // Handle Password Reset Request
  container.querySelector('#resetForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = container.querySelector('#resetEmail').value
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      })
      
      if (error) throw error
      
      alert('Check your email for the password reset link')
      // Switch back to sign in form
      forgotPasswordForm.classList.add('hidden')
      signInForm.classList.remove('hidden')
    } catch (error) {
      console.error('Error requesting password reset:', error.message)
      alert(error.message)
    }
  })

  return {
    unmount: () => {
      container.innerHTML = ''
    }
  }
} 