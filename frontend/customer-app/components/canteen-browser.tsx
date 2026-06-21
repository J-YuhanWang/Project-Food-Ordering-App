'use client'

import { useMemo, useState ,useEffect} from 'react'
import { Search } from 'lucide-react'
import apiClient from "@/lib/api/client";
import { CanteenCard } from '@/components/canteen-card'
import {CanteenDTO} from "@/lib/canteens";


export function CanteenBrowser(){
  const [canteens,setCanteens] = useState<CanteenDTO[]>([])
  const [query, setQuery] = useState('')
  const [type, setType] = useState('ALL')
  useEffect(()=> {
    apiClient.get('/api/v1/canteens')
        .then((response)=>{
          console.log(response.data.data)
          setCanteens(response.data.data)
        })
  },[])

  const types = useMemo(
    () => ['ALL', ...Array.from(new Set(canteens.map((c) => c.canteenType)))],
    [canteens],
  )

  const filtered = useMemo(() => {
    return canteens.filter((c) => {
      const matchesType = type === 'ALL' || c.canteenType === type
      const matchesQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
      return matchesType && matchesQuery
    })
  }, [canteens, query, type])

  return (
    <section id="canteens" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Pick your canteen
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'spot' : 'spots'} ready
            to serve you today.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search canteens or dishes…"
            aria-label="Search canteens"
            className="w-full rounded-xl border border-[#EAE5D9] bg-card py-3 pl-10 pr-4 text-sm text-foreground shadow-[0_8px_30px_rgb(230,225,210,0.4)] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={
              type === t
                ? 'rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground'
                : 'rounded-xl border border-[#EAE5D9] bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
            }
          >
            {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((canteen) => (
            <CanteenCard key={canteen.id} canteen={canteen} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-[#EAE5D9] bg-card py-16 text-center">
          <p className="font-heading text-xl font-semibold text-foreground">
            No canteens found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or filter.
          </p>
        </div>
      )}
    </section>
  )
}
