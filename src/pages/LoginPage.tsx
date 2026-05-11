import { useState, useEffect, useMemo } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CreditCard, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/stores/auth.store';
import LoadingScreen from '@/components/auth/LoadingScreen';

/* ─── AnimatedDots component ────────────────────────────────── */
const AnimatedDots = () => {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return (
    <span
      style={{ display: 'inline-block', width: '24px', textAlign: 'left', letterSpacing: '1px' }}
    >
      {'.'.repeat(dots)}
    </span>
  );
};

/* ─── Preserved logic ──────────────────────────────────────── */
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DNI_RE = /^[0-9]{7,8}[A-Za-z]$/;

/* ─── Figma design tokens ───────────────────────────────────── */
const DM = "'DM Sans', sans-serif";
const GK = "'Space Grotesk', sans-serif";

// Colors (extracted from Figma nodes 538-19053, 544-21594)
const C = {
  pageBg: '#F4F5F0', // page background (desktop right half + mobile card)
  title: '#000000', // DM Sans 700 32px / 24px mobile
  body: '#000000', // DM Sans 400 18px / 15px mobile
  labelTxt: '#2A2D32', // label above input
  ckboxTxt: '#585E6A', // checkbox label
  helper: '#727988', // helper text
  errRed: '#D31212', // error text color
  optSelBg: '#EAE0FF', // selected option background
  optSelBdr: '#2E0099', // selected option border
  optSelTxt: '#20006B', // selected option text
  optBdr: '#DBDDE1', // unselected option border
  optTxt: '#2A2D32', // unselected option text
  inputBdr: '#DBDDE1', // default input border
  inputFoc: '#2E0099', // focused input border
  inputTxt: '#17191C', // input text
  backBdr: '#989EA9', // back button border (1.5px)
  backIcon: '#727988', // back button arrow color
  btnDark: '#17191C', // primary button dark (text + border desktop / bg mobile)
  link: '#2E0099', // interactive link color
};

type Step = 'selector' | 'input' | 'soporte';

/* ─── Input element ─────────────────────────────────────────── */
function InputEl({
  value,
  onChange,
  type = 'text',
  autoComplete,
  autoCapitalize,
  placeholder,
  hasError,
  iconType,
  paddingLeft = 12,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  autoCapitalize?: string;
  placeholder?: string;
  hasError?: boolean;
  iconType?: 'email' | 'dni';
  paddingLeft?: number;
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = hasError ? C.errRed : focused ? C.inputFoc : C.inputBdr;

  return (
    <div style={{ position: 'relative' }}>
      {iconType && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            pointerEvents: 'none',
          }}
        >
          {iconType === 'email' ? (
            <Mail size={15} color={hasError ? C.errRed : '#9B9B95'} />
          ) : (
            <CreditCard size={15} color={hasError ? C.errRed : '#9B9B95'} />
          )}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect="off"
        spellCheck={false}
        placeholder={placeholder}
        className="login-input"
        style={{
          width: '100%',
          height: 40,
          boxSizing: 'border-box',
          padding: `10px 12px 10px ${paddingLeft}px`,
          borderRadius: 8,
          border: hasError ? `1.5px solid ${C.errRed}` : `1px solid ${borderColor}`,
          background: hasError ? 'rgba(253,236,236,0.5)' : C.pageBg,
          fontFamily: DM,
          fontSize: 14,
          fontWeight: 400,
          lineHeight: '16px',
          color: hasError ? C.errRed : C.inputTxt,
          transition: hasError ? 'none' : 'border-color 0.15s ease',
          outline: 'none',
        }}
      />
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function LoginPage() {
  const { login, isSessionValid, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('selector');
  const [goingBack, setGoingBack] = useState(false);

  // Preserved state
  const [loginType, setLoginType] = useState<'email' | 'dni' | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [consented, setConsented] = useState(false);

  // Support form state
  const [supportName, setSupportName] = useState('');
  const [supportSurname, setSupportSurname] = useState('');
  const [supportContact, setSupportContact] = useState('');

  const auroraPills = useMemo(
    () => [
      'Haz una pausa consciente hoy',
      'Escribe una nota de agradecimiento',
      'Dedica 10 minutos a escuchar activamente',
      'Conecta con tu propósito hoy',
    ],
    []
  );

  /* ─── Session checks (preserved) ─── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('origen_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const elapsed = Date.now() - (parsed.loginTimestamp ?? 0);
        if (elapsed < NINETY_DAYS_MS) {
          navigate(parsed.user?.role === 'admin' ? '/admin' : '/calendar', { replace: true });
        } else {
          localStorage.removeItem('origen_user');
          localStorage.removeItem('origen_completions');
          toast.info('Tu sesión ha expirado. Vuelve a acceder.', { duration: 4000 });
        }
      }
    } catch {
      localStorage.removeItem('origen_user');
    }
  }, [navigate]);

  useEffect(() => {
    if (isSessionValid) navigate(isAdmin ? '/admin' : '/calendar', { replace: true });
  }, [isSessionValid, isAdmin, navigate]);

  if (isSessionValid) return null;

  /* ─── Handlers (preserved logic) ─── */
  const handleSubmit = async () => {
    if (!loginType || !consented) return;
    if (!identifier.trim()) {
      toast.error('El campo no puede estar vacío', { duration: 2500 });
      return;
    }
    if (loginType === 'email' && !EMAIL_RE.test(identifier.trim())) {
      toast.error('Introduce un email válido', {
        description: 'Ejemplo: tu.nombre@empresa.com',
        duration: 3000,
      });
      return;
    }
    if (loginType === 'dni' && !DNI_RE.test(identifier.trim())) {
      toast.error('Introduce un DNI válido', { description: 'Formato: 12345678A', duration: 3000 });
      return;
    }
    const MIN_LOADING_MS = 2800;
    const SUCCESS_LOADING_MS = 8000;
    setLoading(true);
    setHasError(false);
    const startTime = Date.now();
    await new Promise((r) => setTimeout(r, 50));
    const success = login(identifier.trim(), loginType);
    if (success) {
      const raw = localStorage.getItem('origen_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const firstName = parsed.user?.name?.split(' ')[0] || 'bienvenido/a';
        toast.success(`Bienvenido/a, ${firstName}`);
        setShowLoader(true);
        setTimeout(
          () => navigate(parsed.user.role === 'admin' ? '/admin' : '/calendar', { replace: true }),
          SUCCESS_LOADING_MS
        );
      }
    } else {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      await new Promise((r) => setTimeout(r, remaining));
      setLoading(false);
      setHasError(true);
    }
  };

  const handleSendNotification = () => {
    setGoingBack(true);
    setStep('selector');
    setHasError(false);
    toast.success('Notificación enviada correctamente');
  };

  /* ─── Navigation ─── */
  const forward = (to: Step) => {
    setGoingBack(false);
    setStep(to);
  };
  const back = (to: Step) => {
    setGoingBack(true);
    setStep(to);
    setIdentifier('');
    setHasError(false);
    setConsented(false);
  };

  /* ─── Transition variants (direction-aware) ─── */
  const d = goingBack ? -1 : 1;
  const stepVariants = {
    initial: { opacity: 0, x: 16 * d },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
    exit: { opacity: 0, x: -16 * d, transition: { duration: 0.2, ease: 'easeIn' as const } },
  };

  const canEntrar = consented && !loading;

  /* ─── Shared styles ─── */
  const heading: React.CSSProperties = {
    margin: '0 0 8px',
    fontFamily: DM,
    fontWeight: 700,
    color: C.title,
    fontSize: 'clamp(20px, 3.5vw, 32px)',
    lineHeight: 'clamp(24px, 4vw, 38px)',
    whiteSpace: 'nowrap',
  };

  const subtext: React.CSSProperties = {
    margin: '0 0 32px',
    fontFamily: DM,
    fontSize: 'clamp(15px, 1.5vw, 18px)',
    fontWeight: 400,
    lineHeight: '24px',
    color: C.body,
  };

  // Primary button — always dark fill, disabled state is grey
  const ctaBtn = (active: boolean): React.CSSProperties => ({
    width: '100%',
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 16px',
    boxSizing: 'border-box',
    borderRadius: 8,
    fontFamily: DM,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '16px',
    border: 'none',
    background: active ? '#17181B' : '#E5E5E0',
    color: active ? '#FFFFFF' : '#9B9B95',
    cursor: active ? 'pointer' : 'not-allowed',
    transition: 'background 0.2s ease, color 0.2s ease',
  });

  return (
    <>
      <LoadingScreen isVisible={showLoader} />

      <style>{`
        .login-input::placeholder { color: #C5C7D0; }

        /* ── CTA button base ── */
        .btn-cta {
          border: none;
          background: ${C.btnDark};
          color: #FFFFFF;
          position: relative;
          overflow: hidden;
        }

        /* ── Layout ── */

        /* MOBILE (<1024px): aurora full-screen bg, card floats over it */
        .login-root { position: fixed; inset: 0; }
        .login-aurora {
          position: absolute; inset: 0;
          background: #0D1117; overflow: hidden;
        }
        .login-form-wrap {
          position: absolute; inset: 0; z-index: 10;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; box-sizing: border-box;
        }
        .login-form-card {
          background: #F4F5F0;
          border-radius: 20px;
          padding: 28px 24px;
          width: 100%; max-width: 480px;
          box-sizing: border-box;
          height: calc(100dvh - 40px);
          max-height: calc(100dvh - 40px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .step-motion-wrap {
          display: flex; flex-direction: column; flex: 1; min-height: 0;
        }
        .step-inner {
          display: flex; flex-direction: column; flex: 1; min-height: 0;
        }
        .step-content {
          flex: 1; overflow-y: auto; min-height: 0;
        }
        .step-footer {
          flex-shrink: 0; padding-top: 0;
        }

        /* DESKTOP (>=1024px): split 50/50 */
        @media (min-width: 1024px) {
          .login-root { display: flex; }
          .login-aurora {
            position: relative;
            flex: 0 0 50%; height: 100%;
            padding: 20px;
            box-sizing: border-box;
            background: ${C.pageBg};
          }
          .login-aurora-inner {
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            width: 100%;
            height: 100%;
            background: #0A0E1F;
          }
          .login-form-wrap {
            position: relative; flex: 1;
            inset: unset; z-index: auto;
            background: ${C.pageBg};
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 20vh;
            padding-left: clamp(24px, 5vw, 72px);
            padding-right: clamp(24px, 5vw, 72px);
            overflow-y: auto;
          }
          .login-form-card {
            background: transparent;
            border-radius: 0; padding: 0;
            max-width: 420px; width: 100%; margin-left: auto; margin-right: auto; max-height: none;
            height: auto; display: block; overflow: visible;
          }
          .step-motion-wrap, .step-inner { display: block; flex: none; min-height: none; }
          .step-content { flex: none; overflow-y: visible; min-height: none; }
          .step-footer { padding-top: 0; }
        }

        /* ── Shooting star border button ── */
        @keyframes shooting-star {
          0%   { offset-distance: 0%; opacity: 1; }
          70%  { opacity: 1; }
          85%  { opacity: 0; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        .btn-star-wrap {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
        }
        .btn-star-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 8px;
          border: 1.5px solid rgba(255,255,255,0.15);
          pointer-events: none;
          z-index: 2;
        }
        .btn-star-comet {
          position: absolute;
          inset: 0;
          border-radius: 8px;
          pointer-events: none;
          z-index: 3;
          overflow: hidden;
        }
        .btn-star-comet::after {
          content: '';
          position: absolute;
          top: -1px; left: -1px;
          width: 80px; height: 3px;
          background: linear-gradient(90deg, transparent 0%, rgba(180,180,180,0.6) 40%, rgba(255,255,255,1) 100%);
          border-radius: 2px;
          offset-path: rect(0px auto auto 0px round 8px);
          animation: shooting-star 2.2s ease-in-out infinite;
        }
        .btn-star-wrap .btn-cta {
          position: relative;
          z-index: 1;
          width: 100%;
          border-radius: 6.5px !important;
        }

        /* Very small screens: allow title to wrap */
        @media (max-width: 380px) {
          .login-heading { white-space: normal !important; font-size: 20px !important; }
        }
      `}</style>

      {/* ── Root ── */}
      <div className="login-root">
        {/* ── Aurora ── (full-screen mobile / left-half desktop) */}
        <div className="login-aurora">
          <div className="login-aurora-inner">
            {/* Shader de gradiente animado como fondo */}
            <div style={{ position: 'absolute', inset: 0 }}>
              <MeshGradient
                style={{ width: '100%', height: '100%' }}
                colors={[
                  '#0A0E1F',
                  '#161528',
                  '#B23A1A',
                  '#DE6A38',
                  '#F2D6C8',
                  '#6BA6DA',
                  '#1E55CE',
                  '#0B2A8E',
                ]}
                distortion={1.2}
                swirl={0.6}
                grainMixer={0}
                grainOverlay={0}
                speed={0.15}
                offsetX={0.08}
              />
            </div>
            <style>{`
              @keyframes aurora-stream-slow {
                0%   { transform: translateY(0%); }
                100% { transform: translateY(-50%); }
              }
              .aurora-pill { background:rgba(255,255,255,0.12); backdrop-filter:blur(12px); border-radius:100px; padding:10px 20px; color:rgba(255,255,255,0.95); font-size:14px; font-family:'DM Sans',sans-serif; font-weight:500; white-space:nowrap; border:1px solid rgba(255,255,255,0.30); text-shadow:0 1px 8px rgba(0,0,0,0.60); box-shadow:0 4px 18px rgba(0,0,0,0.20); }
              .aurora-credits-window {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: min(92%, 560px);
                height: 290px;
                overflow: hidden;
                pointer-events: none;
                mask-image: linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%);
              }
              .aurora-credits-track {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 60px;
                animation: aurora-stream-slow 120s linear infinite;
                will-change: transform;
              }
              .aurora-credit-line {
                width: fit-content;
                max-width: 100%;
                text-align: center;
              }
            `}</style>

            {/* Pills tipo créditos de película */}
            <div className="aurora-credits-window">
              <div className="aurora-credits-track">
                {Array.from({ length: 12 })
                  .flatMap(() => auroraPills)
                  .map((text, i) => (
                    <div key={i} className="aurora-pill aurora-credit-line">
                      {text}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Form wrap ── (centered overlay mobile / right-half desktop) */}
        <div className="login-form-wrap">
          {/* Card (rounded + bg mobile / transparent desktop) */}
          <div className="login-form-card">
            {/* 1. Back button — always in DOM, visibility toggled, NO animation */}
            <button
              onClick={() => back('selector')}
              style={{
                visibility: step === 'input' ? 'visible' : 'hidden',
                pointerEvents: step === 'input' ? 'auto' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                flexShrink: 0,
                marginBottom: 16,
                background: 'transparent',
                border: '1px solid #989EA9',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} color="#989EA9" />
            </button>

            {/* 2. Fixed title — always visible on selector and input, hidden on soporte */}
            {step !== 'soporte' && (
              <h1 className="login-heading" style={{ ...heading, marginBottom: 8 }}>
                Accede a tu calendario
              </h1>
            )}

            <div className="step-motion-wrap">
              <AnimatePresence mode="wait">
                {/* ══ PASO 1: SELECTOR ══ */}
                {step === 'selector' && (
                  <motion.div
                    key="selector"
                    className="step-inner"
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="step-content">
                      {/* Subtitle */}
                      <p style={subtext}>
                        ¿Utilizas en tu día a día el correo
                        <br />
                        de la empresa?
                      </p>

                      {/* Options — gap: 8px (Figma: Frame 3 gap=8) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(['email', 'dni'] as const).map((type) => {
                          const sel = loginType === type;
                          return (
                            <button
                              key={type}
                              onClick={() => {
                                setLoginType(type);
                                forward('input');
                              }}
                              style={{
                                /* Figma: input-container 378x64, pad 24/24/16/16, r=8 */
                                width: '100%',
                                height: 64,
                                padding: '0 16px',
                                boxSizing: 'border-box',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: 8,
                                fontFamily: DM,
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: '16px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                border: sel ? `1px solid ${C.optSelBdr}` : `1px solid ${C.optBdr}`,
                                background: sel ? C.optSelBg : C.pageBg,
                                color: sel ? C.optSelTxt : C.optTxt,
                              }}
                            >
                              {type === 'email'
                                ? 'Sí, trabajo con el correo de la empresa'
                                : 'No, no uso el correo en mi día a día'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ══ PASO 2: INPUT ══ */}
                {step === 'input' && loginType && (
                  <motion.div
                    key="input"
                    className="step-inner"
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="step-content">
                      {/* Input + Checkbox — Figma: Frame 37, gap=20 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Input field — Figma: Frame 34, gap=4 (label → input → helper) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {/* Label — DM Sans 400 12px, #2A2D32 */}
                          <span
                            style={{
                              fontFamily: DM,
                              fontSize: 12,
                              fontWeight: 400,
                              lineHeight: '16px',
                              color: C.labelTxt,
                            }}
                          >
                            {loginType === 'email' ? 'Correo' : 'DNI'}
                          </span>

                          {/* Input — Figma: input-container 378x40, r=8, pad 10/10/12/12 */}
                          <InputEl
                            value={identifier}
                            onChange={(v) => {
                              setIdentifier(v);
                              if (hasError) setHasError(false);
                            }}
                            type={loginType === 'email' ? 'email' : 'text'}
                            autoComplete={loginType === 'email' ? 'email' : 'off'}
                            autoCapitalize={loginType === 'dni' ? 'characters' : 'off'}
                            placeholder={
                              loginType === 'email'
                                ? 'Introduce tu correo de empresa'
                                : 'Introduce tu DNI sin guiones'
                            }
                            hasError={hasError}
                            iconType={loginType}
                            paddingLeft={36}
                          />

                          {/* Error helper — Figma: Space Grotesk 500 10px lh=12px, #D31212 */}
                          <AnimatePresence>
                            {hasError && (
                              <motion.p
                                key="err"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                style={{
                                  margin: 0,
                                  overflow: 'hidden',
                                  fontFamily: GK,
                                  fontSize: 10,
                                  fontWeight: 500,
                                  lineHeight: '12px',
                                  color: C.errRed,
                                }}
                              >
                                El {loginType === 'email' ? 'correo' : 'DNI'} introducido no
                                corresponde a ningún usuario. Si el problema persiste{' '}
                                <span
                                  onClick={() => forward('soporte')}
                                  style={{
                                    color: C.link,
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                  }}
                                >
                                  haz click aquí
                                </span>
                                .
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Checkbox — Figma: Checkbox 378x20, r=4, border #DBDDE1 1.5px unchecked / bg #000 checked */}
                        <label
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'flex-start',
                            cursor: 'pointer',
                          }}
                        >
                          <div
                            onClick={() => setConsented((c) => !c)}
                            style={{
                              width: 16,
                              height: 16,
                              flexShrink: 0,
                              marginTop: 2,
                              borderRadius: 4,
                              boxSizing: 'border-box',
                              cursor: 'pointer',
                              background: consented ? '#000000' : 'transparent',
                              border: consented ? 'none' : `1.5px solid ${C.optBdr}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {consented && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="#FFFFFF"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          {/* DM Sans 400 12px, #585E6A */}
                          <span
                            style={{
                              fontFamily: DM,
                              fontSize: 12,
                              fontWeight: 400,
                              lineHeight: '16px',
                              color: C.ckboxTxt,
                            }}
                          >
                            Acepto los{' '}
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              style={{
                                color: 'var(--color-link, #0D65D9)',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                              }}
                            >
                              términos legales
                            </a>{' '}
                            y la{' '}
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              style={{
                                color: 'var(--color-link, #0D65D9)',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                              }}
                            >
                              política de privacidad
                            </a>
                            .
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Entrar button — pinned to bottom */}
                    <div className="step-footer" style={{ paddingTop: 24 }}>
                      {loading ? (
                        <button
                          type="button"
                          disabled
                          style={{
                            ...ctaBtn(true),
                            cursor: 'default',
                          }}
                        >
                          <span>
                            Entrando
                            <AnimatedDots />
                          </span>
                        </button>
                      ) : (
                        <div className="btn-star-wrap">
                          <div className="btn-star-comet" />
                          <button
                            className="btn-cta"
                            onClick={canEntrar ? handleSubmit : undefined}
                            disabled={!canEntrar}
                            style={ctaBtn(canEntrar)}
                          >
                            <span>Entrar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ══ PASO 3: SOPORTE ══ */}
                {step === 'soporte' && (
                  <motion.div
                    key="soporte"
                    className="step-inner"
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="step-content">
                      {/* Title — Figma: DM Sans 700 32px, #000 */}
                      <h1 className="login-heading" style={{ ...heading, whiteSpace: 'normal' }}>
                        No hemos podido
                        <br />
                        verificar tu {loginType === 'dni' ? 'DNI' : 'correo'}
                      </h1>
                      {/* Subtitle — Figma: DM Sans 400 18px, #000 */}
                      <p style={subtext}>
                        Rellena el formulario y revisaremos tu caso para que puedas acceder
                      </p>

                      {/* Fields — Figma: Frame 32, gap=12 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(
                          [
                            {
                              label: 'Nombre',
                              placeholder: 'Introduce tu nombre',
                              value: supportName,
                              set: setSupportName,
                            },
                            {
                              label: 'Apellidos',
                              placeholder: 'Introduce tus apellidos',
                              value: supportSurname,
                              set: setSupportSurname,
                            },
                            {
                              label: loginType === 'dni' ? 'DNI' : 'Correo',
                              placeholder:
                                loginType === 'dni'
                                  ? 'Introduce tu DNI sin guiones'
                                  : 'Introduce tu correo de empresa',
                              value: supportContact,
                              set: setSupportContact,
                            },
                          ] as const
                        ).map(({ label, placeholder, value, set }) => (
                          <div
                            key={label}
                            style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                          >
                            <span
                              style={{
                                fontFamily: DM,
                                fontSize: 12,
                                fontWeight: 400,
                                lineHeight: '16px',
                                color: C.labelTxt,
                              }}
                            >
                              {label}
                            </span>
                            <InputEl value={value} onChange={set} placeholder={placeholder} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buttons row — pinned to bottom */}
                    <div
                      className="step-footer"
                      style={{ paddingTop: 24, display: 'flex', gap: 20 }}
                    >
                      {/* Volver */}
                      <button
                        onClick={() => back('input')}
                        style={{
                          flex: 1,
                          padding: '13px 16px',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          borderRadius: 8,
                          border: `1.5px solid #17181B`,
                          background: '#F4F5F0',
                          fontFamily: DM,
                          fontSize: 14,
                          fontWeight: 400,
                          color: '#17181B',
                          cursor: 'pointer',
                        }}
                      >
                        <ArrowLeft size={16} />
                        Volver
                      </button>
                      {/* Enviar */}
                      <button
                        onClick={handleSendNotification}
                        style={{
                          flex: 1,
                          padding: '13px 16px',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          borderRadius: 8,
                          border: 'none',
                          background: '#17181B',
                          fontFamily: DM,
                          fontSize: 14,
                          fontWeight: 400,
                          color: '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        Enviar
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* login-form-card */}
        </div>
        {/* login-form-wrap */}
      </div>
      {/* login-root */}
    </>
  );
}
