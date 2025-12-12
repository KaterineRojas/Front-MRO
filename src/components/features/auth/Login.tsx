import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../../authConfig';

export function Login() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User is authenticated, redirecting to dashboard...');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.error('Login error:', e);
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-16">
            <img
              src="https://images.squarespace-cdn.com/content/v1/6449f0be1aea3b0d974f5af0/d6e90988-9b25-45db-967a-f110ffa9cfd3/amaxst+logo+side-07.png?format=750w"
              alt="AMAXST Logo"
              className="h-15 w-auto object-contain"
            />
          </div>

          {/* Main heading */}
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Welcome to Your Inventory Hub
            </h1>
            {/* <p className="text-xl text-blue-100/80 leading-relaxed">
              Streamline your maintenance, repair, and operations with our enterprise-grade management platform.
            </p> */}
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 grid grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Real-time Tracking</h3>
              <p className="text-sm text-green-100/60">Monitor inventory levels instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Team Collaboration</h3>
              <p className="text-sm text-green-100/60">Work together seamlessly</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-green-100/50 text-sm">
          © 2025 MRO Inventory System. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src="https://images.squarespace-cdn.com/content/v1/6449f0be1aea3b0d974f5af0/6cdb1a2e-b659-4239-86a6-8c625f29a16f/amaxst+logo+side-04.png"
              alt="AMAXST Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign in
            </h2>
            <p className="text-gray-500">
              Access your inventory management dashboard
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Sign In Button */}
            <button
              onClick={handleLogin}
              disabled={inProgress !== 'none'}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-gray-300 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inProgress !== 'none' ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-green-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-base">Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                  <span className="text-base">Continue with Microsoft</span>
                </>
              )}
            </button>

            {/* Info */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Sign in with your company Microsoft account to access the platform
            </p>

            {/* Security Badge */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400 text-xs">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Protected by Azure Active Directory</span>
            </div>
          </div>

          {/* Help Text */}
          {/* <p className="mt-6 text-center text-sm text-gray-500">
            Need help?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </a>
          </p> */}
        </div>
      </div>
    </div>
  );
}
