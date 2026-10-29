import {
  X, Award, CheckCircle2, Sparkles, Mail, Lock, ArrowRight, AlertCircle
} from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  userAuth,
  authMode,
  setAuthMode,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  nameInput,
  setNameInput,
  authError,
  setAuthError,
  authLoadingProvider,
  handleOAuthLogin,
  handleEmailAuth,
  handleGuestLogin,
  handleSignOut,
  selectedPlacesCount,
  selectedLanguage,
  t
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#D4AF37] shadow-2xl relative p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {userAuth.isLoggedIn && !userAuth.isGuest ? (
          <div className="text-center py-2 space-y-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#8B0000] to-[#550000] text-[#F5D77F] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-md text-2xl font-heritage font-bold">
              {(userAuth.name || 'R').charAt(0)}
            </div>
            <div>
              <h3 className="font-heritage text-lg font-bold text-[#8B0000]">
                {selectedLanguage === 'hi' ? userAuth.nameHi : userAuth.name}
              </h3>
              <p className="text-xs text-[#6B5E55] mt-0.5">{userAuth.email}</p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{selectedLanguage === 'hi' ? 'सक्रिय शाही पास' : 'Active Heritage Pass'}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D4AF37]/30 text-xs text-[#6B5E55] text-left space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-stone-700">Connected via:</span>
                <span className="font-bold text-[#8B0000]">{userAuth.provider || 'Social Account'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-stone-700">Saved Itinerary:</span>
                <span className="font-bold text-[#8B0000]">{selectedPlacesCount} Landmarks</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {selectedLanguage === 'hi' ? 'भ्रमण जारी रखें' : 'Continue Exploring'}
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-300 transition-colors cursor-pointer"
              >
                {selectedLanguage === 'hi' ? 'लॉगआउट करें' : 'Sign Out'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#8B0000]/10 border border-[#D4AF37] flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-[#8B0000]" />
              </div>
              <h3 className="font-heritage text-xl font-bold text-[#8B0000]">
                {authMode === 'signin' ? t('authTitleSignIn') : t('authTitleSignUp')}
              </h3>
              <p className="text-xs text-[#6B5E55]">
                {t('authSubtitle')}
              </p>
            </div>

            {/* Quick OAuth Buttons */}
            <div className="space-y-2.5 mb-4">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('Google')}
                disabled={authLoadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 active:bg-stone-100 text-xs font-semibold text-stone-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {authLoadingProvider === 'Google' ? (
                  <Sparkles className="w-4 h-4 animate-spin text-[#8B0000]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>
                  {authLoadingProvider === 'Google'
                    ? (selectedLanguage === 'hi' ? 'गूगल से कनेक्ट हो रहा है...' : 'Connecting to Google...')
                    : t('googleOAuth')}
                </span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('Facebook')}
                disabled={authLoadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 active:bg-[#1877F2]/15 text-xs font-semibold text-[#1877F2] shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {authLoadingProvider === 'Facebook' ? (
                  <Sparkles className="w-4 h-4 animate-spin text-[#1877F2]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                <span>
                  {authLoadingProvider === 'Facebook'
                    ? (selectedLanguage === 'hi' ? 'फेसबुक से कनेक्ट हो रहा है...' : 'Connecting to Facebook...')
                    : t('fbOAuth')}
                </span>
              </button>

              {/* Instagram */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('Instagram')}
                disabled={authLoadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-pink-200 bg-linear-to-r from-pink-50/70 via-purple-50/40 to-pink-50/70 hover:from-pink-100/80 hover:to-purple-100/60 active:from-pink-100 text-xs font-semibold text-[#C13584] shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {authLoadingProvider === 'Instagram' ? (
                  <Sparkles className="w-4 h-4 animate-spin text-[#C13584]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0 text-[#C13584]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                )}
                <span>
                  {authLoadingProvider === 'Instagram'
                    ? (selectedLanguage === 'hi' ? 'इंस्टाग्राम से कनेक्ट हो रहा है...' : 'Connecting to Instagram...')
                    : t('instaOAuth')}
                </span>
              </button>
            </div>

            <div className="relative flex py-2 items-center mb-3">
              <div className="grow border-t border-stone-200"></div>
              <span className="shrink mx-3 text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                or with Email
              </span>
              <div className="grow border-t border-stone-200"></div>
            </div>

            {authError && (
              <div className="mb-3 p-2 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('fullName')}
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Maharana Pratap"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('emailAddr')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 border border-[#D4AF37] cursor-pointer"
              >
                <span>{authMode === 'signin' ? t('signInBtn') : t('signUpBtn')}</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col items-center gap-2 text-xs text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setAuthError('');
                }}
                className="text-[#8B0000] font-semibold hover:underline cursor-pointer"
              >
                {authMode === 'signin' ? t('noAccount') : t('hasAccount')}
              </button>

              <button
                type="button"
                onClick={handleGuestLogin}
                className="text-stone-500 hover:text-[#8B0000] font-medium cursor-pointer"
              >
                {t('exploreGuestBtn')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

