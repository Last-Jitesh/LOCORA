import React, { useCallback, useEffect, useState } from 'react';
import { MapPin, ExternalLink, Phone, Navigation, Coffee, ShoppingCart, Activity, BookOpen, Pill, Utensils, Building2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { placesApi } from '../api/places';
import type { NearbyPlace } from '../api/places';

// ── Category helpers ─────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'catering.cafe':                  { label: 'Café',         icon: <Coffee size={13} />,       color: '#C8941A' },
  'catering.restaurant':            { label: 'Restaurant',   icon: <Utensils size={13} />,     color: '#C8941A' },
  'catering.fast_food':             { label: 'Fast Food',    icon: <Utensils size={13} />,     color: '#C8941A' },
  'healthcare.pharmacy':            { label: 'Pharmacy',     icon: <Pill size={13} />,         color: '#7A9E4E' },
  'healthcare':                     { label: 'Healthcare',   icon: <Pill size={13} />,         color: '#7A9E4E' },
  'commercial.supermarket':         { label: 'Supermarket',  icon: <ShoppingCart size={13} />, color: '#6B8BE8' },
  'commercial.grocery_or_supermarket': { label: 'Grocery',  icon: <ShoppingCart size={13} />, color: '#6B8BE8' },
  'sport':                          { label: 'Sport',        icon: <Activity size={13} />,     color: '#9E4E4E' },
  'sport.fitness':                  { label: 'Gym',          icon: <Activity size={13} />,     color: '#9E4E4E' },
  'education':                      { label: 'Education',    icon: <BookOpen size={13} />,     color: '#8B7050' },
  'education.school':               { label: 'School',       icon: <BookOpen size={13} />,     color: '#8B7050' },
};

function getCategoryMeta(cat: string) {
  // Exact match first, then prefix match
  if (CATEGORY_META[cat]) return CATEGORY_META[cat];
  const prefix = Object.keys(CATEGORY_META).find((k) => cat.startsWith(k));
  if (prefix) return CATEGORY_META[prefix];
  return { label: 'Place', icon: <Building2 size={13} />, color: '#8B7050' };
}

const CATEGORY_FILTERS = [
  { label: 'All',          value: '' },
  { label: 'Food & Drink', value: 'catering' },
  { label: 'Healthcare',   value: 'healthcare' },
  { label: 'Shopping',     value: 'commercial' },
  { label: 'Sport & Gym',  value: 'sport' },
  { label: 'Education',    value: 'education' },
];

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  lat: number;
  lng: number;
  /** Optional label for context: e.g. the business name */
  contextLabel?: string;
}

export const NearbyPlaces: React.FC<Props> = ({ lat, lng, contextLabel }) => {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(1000);
  const [filterCat, setFilterCat] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const categories = filterCat
        ? `${filterCat}.cafe,${filterCat}.restaurant,${filterCat}.pharmacy,${filterCat}.supermarket,${filterCat}.fitness,${filterCat}.school,${filterCat}`
        : 'catering.cafe,catering.restaurant,healthcare.pharmacy,commercial.supermarket,commercial.grocery_or_supermarket,sport.fitness,education.school';

      const res = await placesApi.getNearby({ lat, lng, radius, categories, limit: 30 });
      if (res.data.success) {
        setPlaces(res.data.data);
      }
    } catch {
      // silently fail — non-critical widget
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radius, filterCat]);

  useEffect(() => {
    if (lat && lng) fetchPlaces();
  }, [fetchPlaces, lat, lng]);

  const displayed = showAll ? places : places.slice(0, 6);

  return (
    <div className="card p-0 overflow-hidden mt-0">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-3.5 border-b border-[#C8941A]/10 flex items-center justify-between bg-[#1A1208]/60 hover:bg-[#1A1208]/90 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Navigation size={16} className="text-[#C8941A]" />
          <h3 className="font-serif text-base font-bold text-[#F5E6C8]">
            Nearby Places
            {contextLabel && (
              <span className="font-normal text-[#8B7050] text-xs ml-2">
                — around {contextLabel}
              </span>
            )}
          </h3>
          {!loading && (
            <span className="ml-1 text-[10px] text-[#8B7050] bg-[#C8941A]/10 px-1.5 py-0.5 rounded">
              {places.length} found
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-[#8B7050]" />
        ) : (
          <ChevronDown size={16} className="text-[#8B7050]" />
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Radius selector */}
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="filter-chip bg-[#1A1208] text-[#C8A96E] border border-[#C8941A]/20 py-1 px-2.5 rounded-full text-[11px] font-semibold focus:outline-none focus:border-[#C8941A]"
            >
              <option value={500}>Within 500 m</option>
              <option value={1000}>Within 1 km</option>
              <option value={2000}>Within 2 km</option>
              <option value={5000}>Within 5 km</option>
            </select>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterCat(f.value)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                    filterCat === f.value
                      ? 'bg-[#C8941A]/30 border-[#C8941A] text-[#F5E6C8]'
                      : 'bg-transparent border-[#C8941A]/15 text-[#8B7050] hover:border-[#C8941A]/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-[#8B7050]">
              <Loader2 size={18} className="animate-spin text-[#C8941A]" />
              <span className="text-xs">Fetching nearby places via Geoapify...</span>
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-8">
              <MapPin size={32} className="mx-auto text-[#8B7050] opacity-40 mb-2" />
              <p className="text-xs text-[#8B7050]">No places found within {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}</p>
              <button
                onClick={() => setRadius((r) => Math.min(r * 2, 10000))}
                className="mt-2 text-[10px] text-[#C8941A] hover:underline"
              >
                Expand search radius →
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayed.map((place) => {
                  const meta = getCategoryMeta(place.category);
                  const distStr = place.distance != null
                    ? place.distance >= 1000
                      ? `${(place.distance / 1000).toFixed(1)} km`
                      : `${Math.round(place.distance)} m`
                    : null;

                  return (
                    <div
                      key={place.id}
                      className="bg-[#0F0A04]/60 border border-[#C8941A]/10 rounded-lg p-3 flex items-start gap-2.5 hover:border-[#C8941A]/30 transition-all group"
                    >
                      {/* Category icon */}
                      <div
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                        style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}30` }}
                      >
                        {meta.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-[#F5E6C8] leading-snug line-clamp-1 group-hover:text-white transition-colors">
                            {place.name}
                          </p>
                          {place.website && (
                            <a
                              href={place.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-[#C8941A] hover:text-[#F5E6C8] transition-colors"
                              title="Visit website"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: `${meta.color}20`, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          {distStr && (
                            <span className="text-[9px] text-[#8B7050] flex items-center gap-0.5">
                              <MapPin size={8} /> {distStr}
                            </span>
                          )}
                        </div>

                        {place.address && (
                          <p className="text-[10px] text-[#8B7050] mt-1 line-clamp-1">{place.address}</p>
                        )}

                        {place.phone && (
                          <a
                            href={`tel:${place.phone}`}
                            className="flex items-center gap-1 text-[10px] text-[#C8941A]/70 hover:text-[#C8941A] transition-colors mt-0.5"
                          >
                            <Phone size={10} />
                            <span>{place.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {places.length > 6 && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="w-full text-xs text-[#C8941A] hover:text-[#F5E6C8] font-semibold py-1.5 border border-[#C8941A]/15 rounded-lg hover:border-[#C8941A]/40 transition-all"
                >
                  {showAll ? `Show less ↑` : `Show all ${places.length} places ↓`}
                </button>
              )}
            </>
          )}

          {/* Powered by badge */}
          <p className="text-[9px] text-[#8B7050]/50 text-right">
            Powered by{' '}
            <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B7050]">
              Geoapify
            </a>
          </p>
        </div>
      )}
    </div>
  );
};
