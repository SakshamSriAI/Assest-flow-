import React, { useState } from 'react'
import { Info, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const AuthScreen: React.FC = () => {
  const { loginUser, signupUser, departments } = useApp()

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')

  // Login Form States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Signup Form States
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupDept, setSignupDept] = useState(departments[0]?.id || 'dept-eng')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const targetEmail = email.trim() || 'eleanor.vance@assetflow.corp'
    const success = loginUser(targetEmail)
    if (!success) {
      // Fallback to Eleanor for seamless testing if unassigned mock email is used
      loginUser('eleanor.vance@assetflow.corp')
    }
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('')

    if (!signupName.trim()) {
      setSignupError('Please provide your full legal name.')
      return
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please provide a valid corporate email address.')
      return
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.')
      return
    }
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.')
      return
    }

    // Strictly provisions an employee account (no self-elevation)
    signupUser(signupName, signupEmail, signupDept)
    setSignupSuccess(true)
    setTimeout(() => {
      setMode('login')
      setSignupSuccess(false)
    }, 1500)
  }

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotSent(true)
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center p-4 bg-[#F8F9FA]">
      {/* Centered Authentication Card */}
      <div className="w-full max-w-md bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden transition-all">
        {/* ========================================================================= */}
        {/* VIEW 1: WIREFRAME-EXACT LOGIN VIEW */}
        {/* ========================================================================= */}
        {mode === 'login' && (
          <>
            {/* 1. Card Header */}
            <div className="py-4 px-6 text-center border-b border-slate-200">
              <h1 className="text-base font-semibold text-[#0F172A] tracking-tight font-heading">
                AssetFlow – login
              </h1>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* 2. Logo Area */}
              <div className="flex justify-center pt-1">
                <div className="w-14 h-14 rounded-full bg-[#0F2F57] text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-xs select-none">
                  AF
                </div>
              </div>

              {/* 3. Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {error && (
                  <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="login-email" className="block text-xs font-medium text-[#0F172A]">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="login-password" className="block text-xs font-medium text-[#0F172A]">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="**********"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  />

                  {/* Forgot Password Text Link */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer transition-colors"
                    >
                      Forgot password
                    </button>
                  </div>
                </div>

                {/* Login Submit Action */}
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-medium text-sm transition-colors shadow-xs cursor-pointer mt-2"
                >
                  Login
                </button>
              </form>

              {/* 4. Horizontal Divider Line */}
              <div className="relative pt-2">
                <hr className="border-slate-200" />
              </div>

              {/* 5. Signup / New User Section */}
              <div className="space-y-3.5 pt-1 text-left">
                <p className="text-sm text-slate-500 font-medium">
                  New here?
                </p>

                {/* Important Callout Box: strict no-self-elevation RBAC rule */}
                <div className="bg-[#EFF6FF] border border-blue-100 text-[#1E40AF] p-3 rounded-md text-sm flex items-start gap-2.5 leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5" />
                  <span>
                    Sign up creates an employee account. Admin roles assigned later.
                  </span>
                </div>

                {/* Full-width Secondary Create Account Button */}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-2xs"
                >
                  Create Account
                </button>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SIGNUP VIEW (STRICT EMPLOYEE PROVISIONING) */}
        {/* ========================================================================= */}
        {mode === 'signup' && (
          <>
            <div className="py-4 px-6 text-center border-b border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-500 hover:text-[#0F172A] p-1 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                title="Back to login"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-base font-semibold text-[#0F172A] tracking-tight font-heading">
                AssetFlow – create account
              </h1>
              <div className="w-6" />
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {/* Important Callout Box */}
              <div className="bg-[#EFF6FF] border border-blue-100 text-[#1E40AF] p-3 rounded-md text-sm flex items-start gap-2.5 leading-relaxed text-left">
                <Info className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5" />
                <span>
                  Sign up creates an employee account. Admin roles assigned later.
                </span>
              </div>

              {signupSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Employee account provisioned! Redirecting to sign in...</span>
                </div>
              )}

              {signupError && (
                <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {signupError}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#0F172A]">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Jordan Miller"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#0F172A]">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#0F172A]">
                    Department
                  </label>
                  <select
                    value={signupDept}
                    onChange={(e) => setSignupDept(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#0F172A]">
                      Password
                    </label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="**********"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#0F172A]">
                      Confirm
                    </label>
                    <input
                      type="password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder="**********"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-medium text-sm transition-colors shadow-xs cursor-pointer mt-2"
                >
                  Create Account
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                >
                  Back to Login
                </button>
              </form>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: FORGOT PASSWORD MOCKUP */}
        {/* ========================================================================= */}
        {mode === 'forgot' && (
          <>
            <div className="py-4 px-6 text-center border-b border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-500 hover:text-[#0F172A] p-1 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                title="Back to login"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-base font-semibold text-[#0F172A] tracking-tight font-heading">
                AssetFlow – reset password
              </h1>
              <div className="w-6" />
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-left">
              <div className="flex justify-center pt-1">
                <div className="w-14 h-14 rounded-full bg-[#0F2F57] text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-xs">
                  AF
                </div>
              </div>

              {forgotSent ? (
                <div className="p-4 rounded-xl bg-[#EFF6FF] border border-blue-100 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#2563EB] mx-auto" />
                  <h4 className="font-bold text-[#0F172A] text-sm">Recovery Link Dispatched</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If an enterprise account matches <strong className="text-[#0F172A]">{forgotEmail}</strong>, instructions to reset your credentials have been sent.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setForgotSent(false)
                    }}
                    className="mt-3 inline-block text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Return to Login &rarr;
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter your registered corporate email to generate a password recovery authentication link.
                  </p>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#0F172A]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-medium text-sm transition-colors shadow-xs cursor-pointer"
                  >
                    Send Recovery Link
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full py-2 px-4 text-xs text-slate-500 hover:text-slate-800 transition-colors text-center block cursor-pointer"
                  >
                    Cancel and return to sign in
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>

      {/* Quick Demo Persona Switcher (Convenient helper for hackathon evaluation) */}
      <div className="mt-6 text-center text-xs text-slate-500">
        <span className="block mb-2 font-medium text-[11px] uppercase tracking-wider text-slate-400">
          Demo One-Click Sign In:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {[
            { label: 'Eleanor (Admin)', email: 'eleanor.vance@assetflow.corp' },
            { label: 'Marcus (Asset Mgr)', email: 'marcus.sterling@assetflow.corp' },
            { label: 'Sarah (Dept Head)', email: 'sarah.jenkins@assetflow.corp' },
            { label: 'David (Employee)', email: 'david.chen@assetflow.corp' },
          ].map((p) => (
            <button
              key={p.email}
              type="button"
              onClick={() => {
                loginUser(p.email)
              }}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
