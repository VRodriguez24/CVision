import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { AuthDivider, AuthField, SocialAuthButtons } from '../../components/auth/index.js';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/index.js';

function validateRegister(values) {
  const errors = {};

  if (!values.name) {
    errors.name = 'Ingresa tu nombre completo.';
  }

  if (!values.email) {
    errors.email = 'Ingresa tu email.';
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Ingresa un email válido.';
  }

  if (values.password.length < 8) {
    errors.password = 'Usa al menos 8 caracteres.';
  } else if (!/[a-z]/.test(values.password) || !/[A-Z]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = 'Incluye mayúscula, minúscula y número.';
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  if (!values.acceptTerms) {
    errors.acceptTerms = 'Debes aceptar los términos para crear una cuenta.';
  }

  return errors;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = [
    { label: '8 caracteres mínimo', valid: values.password.length >= 8 },
    { label: 'Incluye mayúscula, minúscula y número', valid: /[a-z]/.test(values.password) && /[A-Z]/.test(values.password) && /\d/.test(values.password) },
  ];

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegister(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
        acceptedTerms: values.acceptTerms,
        acceptedPrivacy: values.acceptTerms,
        acceptedAiProcessing: values.acceptTerms,
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message =
        error.code === 'EMAIL_ALREADY_EXISTS'
          ? 'Ya existe una cuenta con este email.'
          : 'No pudimos crear la cuenta. Revisa los datos e intenta nuevamente.';

      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <AuthField
          id="name"
          label="Nombre completo"
          icon={User}
          placeholder="Javiera Soto"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={(event) => updateField('name', event.target.value)}
        />
        <AuthField
          id="register-email"
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
          id="register-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          placeholder="••••••••"
          autoComplete="new-password"
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
        />

        <div className="grid gap-2 rounded bg-surface-container-low p-3">
          {passwordChecks.map((check) => (
            <p key={check.label} className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <CheckCircle2
                aria-hidden="true"
                size={16}
                className={check.valid ? 'text-secondary' : 'text-outline'}
              />
              {check.label}
            </p>
          ))}
        </div>

        <AuthField
          id="confirm-password"
          label="Confirmar password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          autoComplete="new-password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
        />

        <label className="flex items-start gap-3 text-body-sm text-on-surface-variant">
          <input
            type="checkbox"
            checked={values.acceptTerms}
            onChange={(event) => updateField('acceptTerms', event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-secondary-container"
          />
          <span>Acepto los términos de servicio y la política de privacidad institucional.</span>
        </label>
        {errors.acceptTerms ? <p className="text-body-sm text-error">{errors.acceptTerms}</p> : null}

        {errors.form ? (
          <div className="rounded border border-secondary-container bg-secondary-container px-4 py-3 text-body-sm text-on-secondary-container">
            {errors.form}
          </div>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="btn-hero-arrow h-12 w-full rounded">
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          <ArrowRight aria-hidden="true" size={18} />
        </Button>
      </form>

      <AuthDivider />
      <SocialAuthButtons />
    </>
  );
}
