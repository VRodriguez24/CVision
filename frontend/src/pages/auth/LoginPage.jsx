import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { AuthDivider, AuthField, SocialAuthButtons } from '../../components/auth/index.js';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/index.js';

function validateLogin(values) {
  const errors = {};

  if (!values.email) {
    errors.email = 'Ingresa tu email institucional o personal.';
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Ingresa un email válido.';
  }

  if (!values.password) {
    errors.password = 'Ingresa tu contraseña.';
  }

  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(values);
      const redirectTo = location.state?.from?.pathname ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error.code === 'EMAIL_VERIFICATION_REQUIRED'
          ? 'Debes verificar tu email antes de iniciar sesión.'
          : 'No pudimos iniciar sesión. Revisa tu email y contraseña.';

      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <AuthField
          id="email"
          label="Email"
          type="email"
          icon={Mail}
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(event) => updateField('email', event.target.value)}
        />

        <AuthField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          placeholder="••••••••"
          autoComplete="current-password"
          value={values.password}
          error={errors.password}
          onChange={(event) => updateField('password', event.target.value)}
          rightElement={
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="text-outline transition-colors hover:text-primary focus-visible:outline-none"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff aria-hidden="true" size={20} /> : <Eye aria-hidden="true" size={20} />}
            </button>
          }
          helperText={
            <Link to="/auth/recover" className="font-heading text-label-sm text-secondary hover:underline">
              Olvidé mi contraseña
            </Link>
          }
        />

        {errors.form ? (
          <div className="rounded border border-error-container bg-error-container px-4 py-3 text-body-sm text-on-error-container">
            {errors.form}
          </div>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="btn-hero-arrow mt-2 h-12 w-full rounded">
          {isSubmitting ? 'Ingresando...' : 'Entrar a mi cuenta'}
          <ArrowRight aria-hidden="true" size={18} />
        </Button>
      </form>

      <AuthDivider />
      <SocialAuthButtons />
    </>
  );
}
