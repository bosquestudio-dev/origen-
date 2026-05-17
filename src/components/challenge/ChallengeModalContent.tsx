import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import AppButton from '@/components/origen/AppButton'
import { useCalendarStore } from '@/stores/calendar.store'
import { useAppStore } from '@/stores/app.store'
import { useAuth } from '@/stores/auth.store'
import { DAY_LABELS } from '@/data/calendar.data'
import type { Challenge } from '@/types/challenge.types'

interface SubProps {
  challenge: Challenge
  completed: boolean
}

function TextChallenge({ challenge, completed }: SubProps) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge, showToast } = useAppStore()
  const [done, setDone] = useState(completed)

  useEffect(() => {
    if (!completed) {
      completeDay(challenge.day)
      setDone(true)
    }
  }, [])

  const handleComplete = () => {
    completeDay(challenge.day)
    setDone(true)
    showToast('¡Reto completado!')
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

      {/* Completado */}
      {done ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22C35D' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="draw-check">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>Completado</span>
        </div>
      ) : (
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
  const { closeChallenge, showToast } = useAppStore()
  const [done, setDone] = useState(completed)
  const [playing, setPlaying] = useState(false)
  const completedRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (completedRef.current) return
    const video = e.currentTarget
    if (video.duration > 0 && video.currentTime / video.duration >= 0.5) {
      completedRef.current = true
      completeDay(challenge.day)
      setDone(true)
      showToast('¡Reto completado!')
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

      {done && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22C35D' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="draw-check">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>Completado</span>
        </div>
      )}
    </div>
  )
}

function SurveyChallenge({ challenge, completed }: SubProps) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge, showToast } = useAppStore()
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
    setDone(true)
    showToast('¡Has completado el reto!')
    setTimeout(closeChallenge, 1200)
  }

  if (done) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 0 4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#989EA9', lineHeight: '13px' }}>
            {dateLabel}
          </span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 24, letterSpacing: '-0.2px', color: '#F4F5F0', lineHeight: '28px', margin: 0 }}>
            {challenge.title}
          </h2>
        </div>
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '14px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
          Ya respondiste esta encuesta.<br />Tus respuestas han sido registradas.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22C35D' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="draw-check">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>Completado</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
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
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 100,
              background: i < answeredCount ? '#22C35D' : 'rgba(255,255,255,0.12)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Question */}
      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 16, color: '#F4F5F0', lineHeight: '22px', margin: 0, textAlign: 'center' }}>
        {q?.question}
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {q?.options.map(opt => {
          const selected = answers[q.id] === opt
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              style={{
                width: 180,
                height: 85,
                borderRadius: 8,
                border: selected ? '1.5px solid #7B6FE8' : '1px solid #DBDDE1',
                background: selected ? 'rgba(123,111,232,0.12)' : 'transparent',
                padding: '24px 16px',
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: selected ? '#F4F5F0' : '#DBDDE1',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '18px',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Reserved button space — always present, visible only on last question */}
      <div style={{ height: 46 }}>
        {isLast && (
          <AppButton onClick={handleSubmit} disabled={!answers[q?.id]}>
            Enviar
          </AppButton>
        )}
      </div>

    </div>
  )
}

function RaffleChallenge({ challenge, completed }: SubProps) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge, showToast } = useAppStore()
  const { user } = useAuth()
  const [done, setDone] = useState(completed)
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    if (completed) {
      toast.info('Ya participaste en este sorteo', {
        description: 'No puedes inscribirte dos veces en el mismo sorteo.',
        duration: 4000,
      })
    }
  }, [completed])

  const handleJoin = () => {
    setSpinning(true)
    setTimeout(() => {
      completeDay(challenge.day)
      setDone(true)
      setSpinning(false)
      showToast('¡Has completado el reto!')
      setTimeout(closeChallenge, 1200)
    }, 2000)
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div style={{
          background: 'rgba(127,119,221,0.1)',
          border: '1px solid rgba(127,119,221,0.2)',
          borderRadius: '8px',
          padding: '14px 16px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '14px',
        }}>
          Ya estás inscrito en este sorteo.<br />No puedes participar dos veces.
        </div>
        <p className="text-xs text-muted-foreground">Te avisaremos si eres el ganador</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{challenge.description}</p>
      {challenge.content.raffleText && (
        <div className="bg-gold/5 border border-gold/20 rounded-card p-4">
          <p className="text-sm text-gold-light">{challenge.content.raffleText}</p>
        </div>
      )}
      {spinning ? (
        <div className="h-16 flex items-center justify-center overflow-hidden">
          <div className="animate-pulse text-lg font-medium text-accent">{user?.name}</div>
        </div>
      ) : (
        <AppButton onClick={handleJoin}>Inscribirme al sorteo</AppButton>
      )}
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
  }
  const Component = components[challenge.type] || TextChallenge

  const hasOwnHeader = challenge.type === 'video' || challenge.type === 'text' || challenge.type === 'survey'

  return (
    <div style={{ padding: hasOwnHeader ? '20px' : '32px 28px' }}>
      {!hasOwnHeader && (
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
