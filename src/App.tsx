import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            DigiNativa
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Interaktiv Kommunal Utbildningsplattform
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Välkommen</h2>
            <p className="text-gray-600 mb-6">
              DigiNativa AI Team är redo att leverera kommunal utbildning!
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setCount((count) => count + 1)}
            >
              Klick räknare: {count}
            </button>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            🤖 Bygg automatiskt av DigiNativa AI Team
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
