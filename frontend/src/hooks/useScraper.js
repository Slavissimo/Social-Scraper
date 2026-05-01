import { useState, useCallback } from 'react'
import { scrapeUrl } from '../utils/api'

export function useScraper() {
  const [state, setState] = useState({
    loading: false,
    data: null,
    error: null,
  })

  const scrape = useCallback(async (url) => {
    setState({ loading: true, data: null, error: null })
    try {
      const data = await scrapeUrl(url)
      setState({ loading: false, data, error: null })
    } catch (err) {
      setState({ loading: false, data: null, error: err.message })
    }
  }, [])

  const reset = useCallback(() => {
    setState({ loading: false, data: null, error: null })
  }, [])

  return { ...state, scrape, reset }
}
