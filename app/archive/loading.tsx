export default function Loading() {
  return (
    <div aria-busy='true' aria-label='Loading' className='animate-pulse space-y-8'>
      <div className='h-12 w-64 bg-muted rounded-md' />
      <div className='grid md:grid-cols-3 gap-6'>
        {[0, 1, 2].map(i => (
          <div key={i} className='h-80 bg-muted rounded-lg' />
        ))}
      </div>
    </div>
  )
}
