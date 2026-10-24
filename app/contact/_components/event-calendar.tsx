/** Luma 행사 캘린더. src 오리진은 next.config.js CSP frame-src 와 묶여 있다(__tests__/event-calendar-csp) */
export function EventCalendar() {
  return (
    <div className='asca-apply__calendar'>
      <iframe
        src='https://luma.com/embed/calendar/cal-ZlettsX2TEJryng/events'
        className='asca-apply__calendar-frame'
        allowFullScreen
        title='동양서예협회 행사 및 전시회 일정 (Luma)'
        loading='lazy'
      />
    </div>
  )
}
