import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/authService';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(formData);
      authService.saveToken(response.token);
      console.log('✅ Registro exitoso:', response.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
      console.error('❌ Register error:', err);
    } finally {
      setLoading(false);
    }
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
              Join Our Platform
            </h1>
            <p className="text-xl text-blue-100/80 leading-relaxed">
              Create your account and start managing your inventory efficiently.
            </p>
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
              <h3 className="text-white font-medium mb-1">Quick Setup</h3>
              <p className="text-sm text-green-100/60">Get started in minutes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Secure & Reliable</h3>
              <p className="text-sm text-green-100/60">Your data is protected</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-green-100/50 text-sm">
          © 2025 MRO Inventory System. All rights reserved.
        </p>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-background">
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">
              Create Account
            </h2>
            <p className="text-gray-500 dark:text-muted-foreground">
              Fill in your details to get started
            </p>
          </div>

          {/* Register Card */}
          <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary transition-all !bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white !border-gray-300 dark:!border-gray-600 placeholder:!text-gray-400 dark:placeholder:!text-gray-500 border [&:-webkit-autofill]:!shadow-[0_0_0_30px_white_inset] dark:[&:-webkit-autofill]:!shadow-[0_0_0_30px_rgb(17,24,39)_inset] [&:-webkit-autofill]:!text-gray-900 dark:[&:-webkit-autofill]:!text-white [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(17,24,39)] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)]"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary transition-all !bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white !border-gray-300 dark:!border-gray-600 placeholder:!text-gray-400 dark:placeholder:!text-gray-500 border [&:-webkit-autofill]:!shadow-[0_0_0_30px_white_inset] dark:[&:-webkit-autofill]:!shadow-[0_0_0_30px_rgb(17,24,39)_inset] [&:-webkit-autofill]:!text-gray-900 dark:[&:-webkit-autofill]:!text-white [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(17,24,39)] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)]"
                  placeholder="tu@empresa.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary transition-all !bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white !border-gray-300 dark:!border-gray-600 placeholder:!text-gray-400 dark:placeholder:!text-gray-500 border [&:-webkit-autofill]:!shadow-[0_0_0_30px_white_inset] dark:[&:-webkit-autofill]:!shadow-[0_0_0_30px_rgb(17,24,39)_inset] [&:-webkit-autofill]:!text-gray-900 dark:[&:-webkit-autofill]:!text-white [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(17,24,39)] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)]"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-muted-foreground">At least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary transition-all !bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white !border-gray-300 dark:!border-gray-600 placeholder:!text-gray-400 dark:placeholder:!text-gray-500 border [&:-webkit-autofill]:!shadow-[0_0_0_30px_white_inset] dark:[&:-webkit-autofill]:!shadow-[0_0_0_30px_rgb(17,24,39)_inset] [&:-webkit-autofill]:!text-gray-900 dark:[&:-webkit-autofill]:!text-white [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(17,24,39)] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)]"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              <div className="text-center pt-4 border-t border-gray-100 dark:border-border">
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-muted-foreground">
              By creating an account, you'll be assigned the default Engineer role.
              <br />
              Contact your administrator to update your permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
