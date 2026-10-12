function AuthView({
  authForm,
  authLoading,
  authMode,
  error,
  onAuthFormChange,
  onAuthSubmit,
  onAuthModeChange,
}) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-mark">TM</div>
        <p className="eyebrow">Practical 8 / 24CS081</p>
        <h1>{authMode === 'login' ? 'Welcome back.' : 'Start with a clean slate.'}</h1>
        <p className="intro-copy">Sign in to manage your private task workspace.</p>
        {error && <div className="message error" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={onAuthSubmit}>
          <label htmlFor="auth-email">Email</label>
          <input id="auth-email" name="email" type="email" value={authForm.email} onChange={onAuthFormChange} placeholder="you@example.com" autoComplete="email" required />
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" name="password" type="password" value={authForm.password} onChange={onAuthFormChange} placeholder="At least 6 characters" minLength="6" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} required />
          <button className="primary-button" type="submit" disabled={authLoading}>{authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Register'} <span aria-hidden="true">→</span></button>
        </form>
        <button className="switch-auth" type="button" onClick={onAuthModeChange}>
          {authMode === 'login' ? 'Need an account? Register' : 'Already registered? Login'}
        </button>
      </section>
    </main>
  )
}

export default AuthView
