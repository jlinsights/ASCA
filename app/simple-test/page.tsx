export default function SimpleTest() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Simple Test Page</h1>
      <p className="text-lg">This is a server component test</p>
      
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="w-20 h-20 bg-red-500 rounded">
          <span className="text-white text-xs p-2">Red</span>
        </div>
        <div className="w-20 h-20 bg-blue-500 rounded">
          <span className="text-white text-xs p-2">Blue</span>
        </div>
        <div className="w-20 h-20 bg-green-500 rounded">
          <span className="text-white text-xs p-2">Green</span>
        </div>
        <div className="w-20 h-20 bg-yellow-500 rounded">
          <span className="text-white text-xs p-2">Yellow</span>
        </div>
      </div>
    </div>
  )
}