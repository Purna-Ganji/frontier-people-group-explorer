import { useEffect, useMemo, useState } from 'react'
import { loadPeopleGroups } from './lib/loadPeopleGroups'
import {
  mergeDuplicateGroups,
  parsePopulation,
  parseLanguages,
  normalizeSearchText,
} from './lib/normalizePeopleGroups'
import './App.css'

function getInitialParam(name) {
  return new URLSearchParams(window.location.search).get(name) || ''
}

function App() {
  const rawGroups = loadPeopleGroups()
  const groups = useMemo(() => mergeDuplicateGroups(rawGroups), [rawGroups])

  const [search, setSearch] = useState(() => getInitialParam('search'))
  const [region, setRegion] = useState(() => getInitialParam('region'))
  const [country, setCountry] = useState(() => getInitialParam('country'))
  const [religion, setReligion] = useState(() => getInitialParam('religion'))
  const [language, setLanguage] = useState(() => getInitialParam('language'))
  const [bibleStatus, setBibleStatus] = useState(() => getInitialParam('bible'))

  const [evangelicalRange, setEvangelicalRange] = useState(() =>
    getInitialParam('evangelical')
  )

  const [populationRange, setPopulationRange] = useState(() =>
    getInitialParam('population')
  )

  const [shortlist, setShortlist] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const shortlistParam = params.get('shortlist')

    if (!shortlistParam) return []

    try {
      const keys = JSON.parse(shortlistParam)

      if (!Array.isArray(keys)) return []

      return groups.filter(group =>
        keys.includes(`${group.name}-${group.country}`)
      )
    } catch {
      return []
    }
  })

  useEffect(() => {
    const params = new URLSearchParams()

    if (search) params.set('search', search)
    if (region) params.set('region', region)
    if (country) params.set('country', country)
    if (religion) params.set('religion', religion)
    if (language) params.set('language', language)
    if (bibleStatus) params.set('bible', bibleStatus)
    if (evangelicalRange) params.set('evangelical', evangelicalRange)
    if (populationRange) params.set('population', populationRange)

    if (shortlist.length > 0) {
      params.set(
        'shortlist',
        JSON.stringify(
          shortlist.map(group => `${group.name}-${group.country}`)
        )
      )
    }

    const query = params.toString()

    const nextUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname

    window.history.replaceState(null, '', nextUrl)
  }, [
    search,
    region,
    country,
    religion,
    language,
    bibleStatus,
    evangelicalRange,
    populationRange,
    shortlist,
  ])

  const regions = [
    ...new Set(
      groups
        .map(group => group.region)
        .filter(Boolean)
    ),
  ].sort()

  const countries = [
    ...new Set(
      groups
        .map(group => group.country?.trim())
        .filter(Boolean)
    ),
  ].sort()

  const religions = [
    ...new Set(
      groups
        .map(group => group.primary_religion?.trim())
        .filter(Boolean)
    ),
  ].sort()

  const languages = [
    ...new Set(
      groups.flatMap(group => parseLanguages(group.language))
    ),
  ].sort()

  const bibleStatuses = [
    ...new Set(
      groups
        .map(group => group.bible_status?.trim())
        .filter(Boolean)
    ),
  ].sort()

  const filteredGroups = groups.filter(group => {
    const normalizedSearch = normalizeSearchText(search.trim())
    const groupLanguages = parseLanguages(group.language)
    const population = parsePopulation(group.population)

    const matchesSearch =
      !normalizedSearch ||
      normalizeSearchText(group.name).includes(normalizedSearch) ||
      normalizeSearchText(group.country).includes(normalizedSearch)

    const matchesRegion =
      !region ||
      group.region === region

    const matchesCountry =
      !country ||
      group.country?.trim() === country

    const matchesReligion =
      !religion ||
      group.primary_religion?.trim().toLowerCase() ===
        religion.toLowerCase()

    const matchesLanguage =
      !language ||
      groupLanguages.some(
        item => item.toLowerCase() === language.toLowerCase()
      )

    const matchesBibleStatus =
      !bibleStatus ||
      group.bible_status?.trim().toLowerCase() ===
        bibleStatus.toLowerCase()

    const evangelicalPercent = Number(
      String(group.evangelical_percent ?? '')
        .replace('%', '')
        .trim()
    )

    let matchesEvangelical = true

    if (evangelicalRange === 'under1') {
      matchesEvangelical =
        !Number.isNaN(evangelicalPercent) &&
        evangelicalPercent < 1
    }

    if (evangelicalRange === '1to5') {
      matchesEvangelical =
        !Number.isNaN(evangelicalPercent) &&
        evangelicalPercent >= 1 &&
        evangelicalPercent < 5
    }

    if (evangelicalRange === '5plus') {
      matchesEvangelical =
        !Number.isNaN(evangelicalPercent) &&
        evangelicalPercent >= 5
    }

    let matchesPopulation = true

    if (populationRange === 'under10k') {
      matchesPopulation =
        population !== null &&
        population < 10_000
    }

    if (populationRange === '10kto100k') {
      matchesPopulation =
        population !== null &&
        population >= 10_000 &&
        population < 100_000
    }

    if (populationRange === '100kto1m') {
      matchesPopulation =
        population !== null &&
        population >= 100_000 &&
        population < 1_000_000
    }

    if (populationRange === '1mplus') {
      matchesPopulation =
        population !== null &&
        population >= 1_000_000
    }

    if (populationRange === 'unknown') {
      matchesPopulation =
        population === null
    }

    return (
      matchesSearch &&
      matchesRegion &&
      matchesCountry &&
      matchesReligion &&
      matchesLanguage &&
      matchesBibleStatus &&
      matchesEvangelical &&
      matchesPopulation
    )
  })

  function toggleShortlist(group) {
    const key = `${group.name}-${group.country}`

    const exists = shortlist.some(
      item =>
        `${item.name}-${item.country}` === key
    )

    if (exists) {
      setShortlist(
        shortlist.filter(
          item =>
            `${item.name}-${item.country}` !== key
        )
      )
    } else {
      setShortlist([...shortlist, group])
    }
  }

  function clearFilters() {
    setSearch('')
    setRegion('')
    setCountry('')
    setReligion('')
    setLanguage('')
    setBibleStatus('')
    setEvangelicalRange('')
    setPopulationRange('')
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch (error) {
      console.error('Unable to copy link:', error)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>People Group Explorer</h1>

        <p>
          Explore unreached people groups and build a shortlist
          for prayer and further research.
        </p>
      </header>

      <section className="controls">
        <input
          type="text"
          placeholder="Search group or country..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
        >
          <option value="">All regions</option>

          {regions.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
        >
          <option value="">All countries</option>

          {countries.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={religion}
          onChange={e => setReligion(e.target.value)}
        >
          <option value="">All religions</option>

          {religions.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          <option value="">All languages</option>

          {languages.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={bibleStatus}
          onChange={e => setBibleStatus(e.target.value)}
        >
          <option value="">All Bible statuses</option>

          {bibleStatuses.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={evangelicalRange}
          onChange={e => setEvangelicalRange(e.target.value)}
        >
          <option value="">All evangelical %</option>
          <option value="under1">Under 1%</option>
          <option value="1to5">1%–5%</option>
          <option value="5plus">5%+</option>
        </select>

        <select
          value={populationRange}
          onChange={e => setPopulationRange(e.target.value)}
        >
          <option value="">All populations</option>
          <option value="under10k">Under 10k</option>
          <option value="10kto100k">10k–100k</option>
          <option value="100kto1m">100k–1M</option>
          <option value="1mplus">1M+</option>
          <option value="unknown">Unknown</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
        >
          Clear filters
        </button>

        <button
          type="button"
          onClick={copyShareLink}
        >
          Copy share link
        </button>
      </section>

      <main className="layout">
        <section className="results">
          <h2>{filteredGroups.length} groups found</h2>

          <div className="grid">
            {filteredGroups.map(group => {
              const population = parsePopulation(group.population)
              const groupLanguages = parseLanguages(group.language)
              const key = `${group.name}-${group.country}`

              const isSelected = shortlist.some(
                item =>
                  `${item.name}-${item.country}` === key
              )

              return (
                <article
                  className="card"
                  key={key}
                >
                  <h3>{group.name}</h3>

                  <p className="location">
                    {group.country || 'Unknown country'} ·{' '}
                    {group.region || 'Unknown region'}
                  </p>

                  <p>
                    <strong>Population:</strong>{' '}
                    {population !== null
                      ? population.toLocaleString()
                      : 'Unknown'}
                  </p>

                  <p>
                    <strong>Religion:</strong>{' '}
                    {group.primary_religion || 'Unknown'}
                  </p>

                  <p>
                    <strong>Languages:</strong>{' '}
                    {groupLanguages.length
                      ? groupLanguages.join(', ')
                      : 'Unknown'}
                  </p>

                  <p>
                    <strong>Bible Status:</strong>{' '}
                    {group.bible_status || 'Unknown'}
                  </p>

                  <p>
                    <strong>Evangelical:</strong>{' '}
                    {group.evangelical_percent || 'Unknown'}
                  </p>

                  {group.duplicateCount > 1 && (
                    <p className="duplicate">
                      Merged from {group.duplicateCount} records
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleShortlist(group)}
                  >
                    {isSelected
                      ? 'Remove from shortlist'
                      : 'Add to shortlist'}
                  </button>
                </article>
              )
            })}
          </div>
        </section>

        <aside className="shortlist">
          <h2>Shortlist</h2>

          <p>{shortlist.length} selected</p>

          {shortlist.length === 0 && (
            <p>No groups selected yet.</p>
          )}

          {shortlist.map(group => (
            <div
              className="shortlist-item"
              key={`${group.name}-${group.country}`}
            >
              <strong>{group.name}</strong>
              <span>{group.country}</span>
            </div>
          ))}
        </aside>
      </main>
    </div>
  )
}

export default App