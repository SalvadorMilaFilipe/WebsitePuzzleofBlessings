import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Centro() {
  const [totalDice, setTotalDice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDice = async (isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true)
        }
        setError(null)

        // Buscar todos os registros da tabela label e somar o campo nmoedas
        const { data, error: fetchError } = await supabase
          .from('label')
          .select('nmoedas')

        if (fetchError) {
          throw fetchError
        }

        // Calcular o total de moedas
        const total = data?.reduce((sum, item) => {
          return sum + (Number(item.nmoedas) || 0)
        }, 0) || 0

        setTotalDice(total)
      } catch (err) {
        console.error('Error fetching dice:', err)
        setError(err.message || 'Error loading data')
      } finally {
        if (isInitial) {
          setLoading(false)
        }
      }
    }

    fetchDice(true) // Passa true para o carregamento inicial

    // Atualizar a cada 5 segundos sem mostrar o loading
    const interval = setInterval(() => fetchDice(false), 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="centro-main" style={{ paddingTop: '100px' }}>
      <div className="container">
        <div className="centro-content">
          <h1 className="centro-title">The Center</h1>
          <p className="centro-subtitle">
            The part connected to the game in real-time. The game sends data to the site
            to resolve things in real-time, creating a dynamic interaction between
            game and site for a complete and integrated experience.
          </p>

          <div className="moedas-counter-box">
            {loading ? (
              <div className="moedas-counter-loading">Loading...</div>
            ) : error ? (
              <div className="moedas-counter-error">Error: {error}</div>
            ) : (
              <div className="moedas-counter-content">
                <div className="moedas-counter-icon-wrapper">
                  <img
                    src="/img/dado.png?v=white"
                    alt="Dado"
                    className="moedas-counter-icon"
                    onError={(e) => {
                      // Fallback se a imagem não for encontrada
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
                <div className="moedas-counter-label">Total of Dice's</div>
                <div className="moedas-counter-value">{totalDice.toLocaleString('pt-PT')}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Centro

