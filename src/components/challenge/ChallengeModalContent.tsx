import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

import AppButton from '@/components/origen/AppButton'
import { useCalendarStore } from '@/stores/calendar.store'
import { useAppStore } from '@/stores/app.store'
import { DAY_LABELS } from '@/data/calendar.data'
import type { Challenge } from '@/types/challenge.types'

interface SubProps {
  challenge: Challenge
  completed: boolean
}

function TextChallenge({ challenge, completed }: SubProps) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge } = useAppStore()
  const [done, setDone] = useState(completed)

  useEffect(() => {
    if (!completed) {
      completeDay(challenge.day)
      setDone(true)
      toast.success('¡Reto completado!')
    }
  }, [])

  const handleComplete = () => {
    completeDay(challenge.day)
    setDone(true)
    toast.success('¡Reto completado!')
    setTimeout(closeChallenge, 1200)
  }

  const dateLabel = DAY_LABELS[challenge.day] ? formatChallengeDate(DAY_LABELS[challenge.day]) : `DÍA ${challenge.day}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header — mismo que video */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            fontSize: 10,
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            color: '#989EA9',
            lineHeight: '13px',
          }}>
            {dateLabel}
          </span>
          <h2 style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: '-0.2px',
            color: '#F4F5F0',
            lineHeight: '28px',
            margin: 0,
          }}>
            {challenge.title}
          </h2>
        </div>
      </div>

      {/* Frase — área principal centrada */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 40px',
        gap: 12,
        borderRadius: 8,
        minHeight: 220,
      }}>
        {challenge.content.actionText && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 20,
            lineHeight: '24px',
            letterSpacing: '-0.2px',
            textAlign: 'center',
            color: '#F7F7F8',
            margin: 0,
          }}>
            {challenge.content.actionText}
          </p>
        )}
      </div>

      {!done && (
        <AppButton onClick={handleComplete}>Marcar como completado</AppButton>
      )}
    </div>
  )
}

const DAY_NAMES: Record<string, string> = {
  'Lun': 'LUNES', 'Mar': 'MARTES', 'Mié': 'MIÉRCOLES',
  'Jue': 'JUEVES', 'Vie': 'VIERNES', 'Sáb': 'SÁBADO', 'Dom': 'DOMINGO',
}

function formatChallengeDate(dateLabel: string): string {
  // dateLabel e.g. "Mar 1" → "MARTES 1 DE DICIEMBRE"
  const [abbr, num] = dateLabel.split(' ')
  const dayName = DAY_NAMES[abbr] ?? abbr.toUpperCase()
  return `${dayName} ${num} DE DICIEMBRE`
}

function VideoChallenge({ challenge, completed }: SubProps) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge } = useAppStore()
  const [done, setDone] = useState(completed)
  const [playing, setPlaying] = useState(false)
  const completedRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!completed) {
      completeDay(challenge.day)
      setDone(true)
      toast.success('¡Reto completado!')
    }
  }, [])

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (completedRef.current) return
    const video = e.currentTarget
    if (video.duration > 0 && video.currentTime / video.duration >= 0.5) {
      completedRef.current = true
      completeDay(challenge.day)
      setDone(true)
      toast.success('¡Reto completado!')
      setTimeout(closeChallenge, 1200)
    }
  }

  const handlePlayClick = () => {
    setPlaying(true)
    videoRef.current?.play()
  }

  const dateLabel = DAY_LABELS[challenge.day] ? formatChallengeDate(DAY_LABELS[challenge.day]) : `DÍA ${challenge.day}`
  const url = challenge.content.videoUrl ?? ''
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            fontSize: 10,
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            color: '#989EA9',
            lineHeight: '13px',
          }}>
            {dateLabel}
          </span>
          <h2 style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: '-0.2px',
            color: '#F4F5F0',
            lineHeight: '28px',
            margin: 0,
          }}>
            {challenge.title}
          </h2>
        </div>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
          fontSize: 14,
          color: '#DBDDE1',
          lineHeight: '20px',
          margin: 0,
        }}>
          {challenge.description}
        </p>
      </div>

      {/* Video */}
      {url && (
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 8,
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.3)',
          position: 'relative',
          flexGrow: 1,
        }}>
          {isYoutube ? (
            <iframe
              src={url}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={url}
                controls={playing}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setPlaying(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {!playing && (
                <div
                  onClick={handlePlayClick}
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: '50%',
                    border: '2.5px solid #F4F5F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 2.5L13 8L4 13.5V2.5Z" fill="#F4F5F0" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

    </div>
  )
}

function SurveyChallenge({ challenge, completed }: SubProps) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge } = useAppStore()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState(completed)
  const questions = challenge.content.questions || []

  const dateLabel = DAY_LABELS[challenge.day] ? formatChallengeDate(DAY_LABELS[challenge.day]) : `DÍA ${challenge.day}`
  const q = questions[current]
  const isLast = current === questions.length - 1
  const answeredCount = Object.keys(answers).length

  const handleSelect = (opt: string) => {
    if (done) return
    setAnswers(prev => ({ ...prev, [q.id]: opt }))
    if (!isLast) {
      setTimeout(() => setCurrent(c => c + 1), 300)
    }
  }

  const handleSubmit = () => {
    completeDay(challenge.day)
    toast.success('¡Has completado el reto!')
    closeChallenge()
  }

  if (done) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      {/* Header + Stepper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#989EA9', lineHeight: '13px' }}>
            {dateLabel}
          </span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 24, letterSpacing: '-0.2px', color: '#F4F5F0', lineHeight: '28px', margin: 0 }}>
            {challenge.title}
          </h2>
        </div>
        {/* Stepper */}
        <div style={{ display: 'flex', gap: 6 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 100, background: i < answeredCount ? '#22C35D' : 'rgba(255,255,255,0.12)', transition: 'background 0.3s ease' }} />
          ))}
        </div>
      </div>

      {/* Question + Options — centered in remaining space */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 16, color: '#F4F5F0', lineHeight: '22px', margin: 0, textAlign: 'center' }}>
          {q?.question}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {q?.options.map(opt => {
            const selected = answers[q.id] === opt
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                style={{
                  width: 180, height: 85, borderRadius: 8,
                  border: selected ? '1.5px solid #22C35D' : '1px solid #DBDDE1',
                  background: selected ? 'rgba(34,195,93,0.12)' : 'transparent',
                  padding: '24px 16px', fontFamily: 'var(--font-sans)', fontSize: 14,
                  color: selected ? '#F4F5F0' : '#DBDDE1', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '18px',
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Button — always reserves space, visible only on last + answered */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 4, minHeight: 46 }}>
        {isLast && answers[q?.id] && (
          <button
            onClick={handleSubmit}
            style={{ width: 164, padding: '12px 0', borderRadius: 8, border: '1.5px solid #F4F5F0', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: '#F4F5F0', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' }}
          >
            Enviar respuestas
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Shared hero layout for raffle & donation ── */
function HeroHeader({ challenge }: { challenge: Challenge }) {
  const dateLabel = DAY_LABELS[challenge.day] ? formatChallengeDate(DAY_LABELS[challenge.day]) : `DÍA ${challenge.day}`
  const imageUrl = challenge.content.imageUrl
  return (
    <div style={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', borderRadius: '20px 20px 0 0', flexShrink: 0 }}>
      {imageUrl && (
        <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      {/* gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 60%)' }} />
      {/* date + title */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, right: 48 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.7)', lineHeight: '13px', display: 'block', marginBottom: 4 }}>
          {dateLabel}
        </span>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 24, letterSpacing: '-0.2px', color: '#FFFFFF', lineHeight: '28px', margin: 0 }}>
          {challenge.title}
        </h2>
      </div>
    </div>
  )
}

function RaffleChallenge({ challenge, completed }: SubProps) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge } = useAppStore()

  if (completed) return null

  const handleJoin = () => {
    completeDay(challenge.day)
    toast.success('¡Has completado el reto!')
    closeChallenge()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <HeroHeader challenge={challenge} />
      <div style={{ padding: '24px 20px 20px', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.85)', lineHeight: '20px', margin: 0, whiteSpace: 'pre-line', alignSelf: 'stretch' }}>
          {challenge.description}
        </p>
        <button
          onClick={handleJoin}
          style={{ width: 164, padding: '12px 0', borderRadius: 8, border: '1.5px solid #F4F5F0', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: '#F4F5F0', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' }}
        >
          Participar del sorteo
        </button>
      </div>
    </div>
  )
}

function StripeForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('10')
  const [loading, setLoading] = useState(false)
  const [fieldFocus, setFieldFocus] = useState<string | null>(null)

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d
  }

  const isValid = card.replace(/\s/g, '').length === 16 && expiry.length >= 4 && cvc.length >= 3 && name.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onSuccess()
    }, 2000)
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: 6,
    border: `1.5px solid ${fieldFocus === field ? '#635BFF' : 'rgba(255,255,255,0.15)'}`,
    background: 'rgba(255,255,255,0.04)',
    fontFamily: 'var(--font-sans)', fontSize: 14,
    color: '#F4F5F0', outline: 'none',
    transition: 'border-color 0.15s ease',
  })

  const AMOUNTS = ['5', '10', '20', '50']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 20px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#635BFF"/><path d="M10.5 7.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v1h1.5v1.5H13.5V12h1.5v1.5H13.5v3h-1.5v-3H10.5V12H12V10.5H10.5V9H12V7.5h-1.5z" fill="white"/></svg>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: '#F4F5F0' }}>Pago seguro con Stripe</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {['VISA', 'MC'].map(b => (
            <span key={b} style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: b === 'VISA' ? '#1A1F71' : '#EB001B', color: '#fff', letterSpacing: '0.05em' }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Amount selector */}
      <div>
        <label style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Importe</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {AMOUNTS.map(a => (
            <button key={a} onClick={() => setAmount(a)} style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `1.5px solid ${amount === a ? '#635BFF' : 'rgba(255,255,255,0.15)'}`, background: amount === a ? 'rgba(99,91,255,0.15)' : 'transparent', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: amount === a ? '#9B8FFF' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.15s ease' }}>
              {a}€
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Titular</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre en la tarjeta" style={inputStyle('name')} onFocus={() => setFieldFocus('name')} onBlur={() => setFieldFocus(null)} />
      </div>

      {/* Card number */}
      <div>
        <label style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Número de tarjeta</label>
        <input value={card} onChange={e => setCard(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" style={inputStyle('card')} onFocus={() => setFieldFocus('card')} onBlur={() => setFieldFocus(null)} inputMode="numeric" />
      </div>

      {/* Expiry + CVC */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Caducidad</label>
          <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM / AA" style={inputStyle('expiry')} onFocus={() => setFieldFocus('expiry')} onBlur={() => setFieldFocus(null)} inputMode="numeric" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>CVC</label>
          <input value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" style={inputStyle('cvc')} onFocus={() => setFieldFocus('cvc')} onBlur={() => setFieldFocus(null)} inputMode="numeric" />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '11px 0', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={!isValid || loading} style={{ flex: 2, padding: '11px 0', borderRadius: 6, border: 'none', background: isValid && !loading ? '#635BFF' : 'rgba(99,91,255,0.3)', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: isValid && !loading ? '#fff' : 'rgba(255,255,255,0.35)', cursor: isValid && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease' }}>
          {loading ? 'Procesando...' : `Donar ${amount}€`}
        </button>
      </div>

      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: 0 }}>
        🔒 Pago cifrado · Datos no almacenados
      </p>
    </div>
  )
}

function DonationChallenge({ challenge, completed }: SubProps) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge } = useAppStore()
  const [done, setDone] = useState(completed)
  const [showForm, setShowForm] = useState(false)

  const handleSuccess = () => {
    completeDay(challenge.day)
    setDone(true)
    toast.success('¡Gracias por tu aportación!')
    setTimeout(closeChallenge, 1200)
  }

  const parts = (challenge.content.bodyText ?? '').split('\n')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {!showForm && <HeroHeader challenge={challenge} />}
      <div style={{ padding: showForm ? 0 : '24px 20px 20px', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', flex: 1, justifyContent: done ? 'center' : undefined }}>
        {done ? (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: '22px', textAlign: 'center', margin: 0 }}>
            Ya realizaste tu aportación.<br />¡Gracias por tu generosidad!
          </p>
        ) : showForm ? (
          <div style={{ width: '100%' }}>
            <StripeForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
          </div>
        ) : (
          <>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.85)', lineHeight: '20px', margin: 0, whiteSpace: 'pre-line', alignSelf: 'stretch' }}>
              {parts.join('\n')}
              {challenge.content.donationLink && challenge.content.donationText && (
                <>{'\n'}{challenge.content.donationText}{' '}
                  <a href={challenge.content.donationLink} target="_blank" rel="noreferrer" style={{ color: '#5B8BF5', textDecoration: 'underline' }}>haz click aquí</a>.
                </>
              )}
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{ width: 164, padding: '12px 0', borderRadius: 8, border: '1.5px solid #F4F5F0', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: '#F4F5F0', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' }}
            >
              Hacer donación
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function CatchUpChallenge({ challenge }: SubProps) {
  const dateLabel = DAY_LABELS[challenge.day] ? formatChallengeDate(DAY_LABELS[challenge.day]) : `DÍA ${challenge.day}`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#989EA9', lineHeight: '13px' }}>
          {dateLabel}
        </span>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 24, letterSpacing: '-0.2px', color: '#F4F5F0', lineHeight: '28px', margin: 0 }}>
          {challenge.title}
        </h2>
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: '22px', margin: 0, textAlign: 'center', padding: '8px 0' }}>
        {challenge.content.bodyText}
      </p>
    </div>
  )
}

interface ChallengeModalContentProps {
  challenge: Challenge
  completed: boolean
}

export default function ChallengeModalContent({ challenge, completed }: ChallengeModalContentProps) {
  const components: Record<string, React.FC<SubProps>> = {
    text: TextChallenge,
    video: VideoChallenge,
    survey: SurveyChallenge,
    raffle: RaffleChallenge,
    donation: DonationChallenge,
    'catch-up': CatchUpChallenge,
  }
  const Component = components[challenge.type] || TextChallenge

  const hasOwnHeader = ['video', 'text', 'survey', 'catch-up'].includes(challenge.type)
  const noWrapPadding = ['raffle', 'donation'].includes(challenge.type)

  return (
    <div style={{ padding: noWrapPadding ? 0 : hasOwnHeader ? '20px' : '32px 28px', height: noWrapPadding ? '100%' : undefined, display: noWrapPadding ? 'flex' : undefined, flexDirection: noWrapPadding ? 'column' : undefined }}>
      {!hasOwnHeader && !noWrapPadding && (
        <div style={{ marginBottom: '20px' }}>
          <span style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
          }}>
            {challenge.label} · Día {challenge.day}
          </span>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.9)',
            marginTop: '8px',
            lineHeight: 1.3,
          }}>
            {challenge.title}
          </h2>
        </div>
      )}
      <Component challenge={challenge} completed={completed} />
    </div>
  )
}
