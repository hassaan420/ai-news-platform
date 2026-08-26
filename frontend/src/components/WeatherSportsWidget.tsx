import React, { useEffect, useState } from 'react';
import { weatherApi } from '../api/weatherApi';
import { sportsApi } from '../api/sportsApi';
import { WeatherResponse } from '../types/weather';
import { SportMatch } from '../types/sports';
import { Skeleton } from './ui/skeleton';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudDrizzle,
  Wind,
  Droplets,
  Edit2,
  Check,
  X
} from 'lucide-react';

const GEOLOCATION_TIMEOUT_MS = 5000;
const SPORTS_TABS = ['football', 'cricket', 'tennis'] as const;

type SportType = typeof SPORTS_TABS[number];

const getWeatherIcon = (iconCode: string) => {
  const code = iconCode.substring(0, 2);
  switch (code) {
    case '01': return <Sun className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]" />;
    case '02':
    case '03':
    case '04': return <Cloud className="w-10 h-10 text-slate-300 drop-shadow-[0_0_15px_rgba(203,213,225,0.4)]" />;
    case '09': return <CloudDrizzle className="w-10 h-10 text-blue-300 drop-shadow-[0_0_15px_rgba(147,197,253,0.4)]" />;
    case '10': return <CloudRain className="w-10 h-10 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)]" />;
    case '11': return <CloudLightning className="w-10 h-10 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />;
    case '13': return <CloudSnow className="w-10 h-10 text-blue-100 drop-shadow-[0_0_15px_rgba(219,234,254,0.4)]" />;
    case '50': return <Wind className="w-10 h-10 text-slate-400 drop-shadow-[0_0_15px_rgba(148,163,184,0.4)]" />;
    default: return <Sun className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]" />;
  }
};

export default function WeatherSportsWidget() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [customCity, setCustomCity] = useState<string | null>(null);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState('');

  const [sportsData, setSportsData] = useState<Record<SportType, SportMatch[] | null>>({
    football: null,
    cricket: null,
    tennis: null
  });
  const [sportsLoading, setSportsLoading] = useState(true);
  const [activeSportTab, setActiveSportTab] = useState<SportType | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async (lat?: number, lon?: number) => {
      try {
        setWeatherLoading(true);
        let data;
        if (customCity) {
          data = await weatherApi.getCurrentWeatherByCity(customCity);
        } else if (lat && lon) {
          data = await weatherApi.getCurrentWeatherByCoordinates(lat, lon);
        } else {
          data = await weatherApi.getCurrentWeatherByCity('London');
        }
        
        if (isMounted) {
          setWeather(data);
          setWeatherError(false);
          if (data && data.city) {
            setCityInput(data.city);
          }
        }
      } catch (err) {
        console.debug('Failed to fetch weather data:', err);
        if (isMounted) setWeatherError(true);
      } finally {
        if (isMounted) setWeatherLoading(false);
      }
    };

    if (customCity) {
      fetchWeather();
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.debug('Geolocation permission denied or failed:', error);
          fetchWeather();
        },
        { timeout: GEOLOCATION_TIMEOUT_MS }
      );
    } else {
      fetchWeather();
    }

    const fetchInitialSports = async () => {
      try {
        const results = await Promise.allSettled(
          SPORTS_TABS.map(sport => sportsApi.getLiveMatches(sport, 1))
        );

        if (!isMounted) return;

        const newSportsData: Record<SportType, SportMatch[] | null> = { ...sportsData };
        let firstSuccessfulTab: SportType | null = null;

        results.forEach((result, index) => {
          const sport = SPORTS_TABS[index];
          if (result.status === 'fulfilled' && result.value?.matches) {
            newSportsData[sport] = result.value.matches.slice(0, 10);
            if (!firstSuccessfulTab) firstSuccessfulTab = sport;
          } else {
            console.debug(`Failed to fetch initial sports data for ${sport}:`, result);
            newSportsData[sport] = null;
          }
        });

        setSportsData(newSportsData);
        if (firstSuccessfulTab && !activeSportTab) {
          setActiveSportTab(firstSuccessfulTab);
        }
      } finally {
        if (isMounted) setSportsLoading(false);
      }
    };

    fetchInitialSports();

    return () => {
      isMounted = false;
    };
  }, [customCity]);

  const handleCitySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cityInput.trim()) {
      setCustomCity(cityInput.trim());
      setIsEditingCity(false);
    }
  };

  const hasAnySports = SPORTS_TABS.some(sport => sportsData[sport] !== null);
  const showWeather = weatherLoading || (!weatherError && weather !== null);
  const showSports = sportsLoading || hasAnySports;

  if (!showWeather && !showSports) {
    return null;
  }

  return (
    <div className="bg-white/[0.2] backdrop-blur-xl border border-white/[0.15] shadow-2xl rounded-2xl overflow-hidden flex flex-col w-full mb-8 transition-all hover:bg-white/[0.12]">
      {/* Weather Section */}
      {showWeather && (
        <div className={`p-5 flex flex-col justify-center ${showSports ? 'border-b border-white/[0.15]' : ''}`}>
          <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-4">Local Weather</h3>
          
          {weatherLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : weather ? (
            <div>
              <div className="flex items-center gap-4 mb-2">
                {getWeatherIcon(weather.iconCode)}
                <div>
                  <div className="font-serif text-3xl font-bold text-white/95">
                    {Math.round(weather.temperatureCelsius)}°
                  </div>
                  <div className="text-sm font-medium text-white capitalize tracking-wide">
                    {weather.description || weather.condition}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {isEditingCity ? (
                  <form onSubmit={handleCitySubmit} className="flex items-center gap-1 w-full max-w-[200px]">
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="Enter city..."
                      className="text-base font-semibold text-foreground bg-muted/50 border border-border rounded-md px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                      autoFocus
                    />
                    <button type="submit" className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded">
                      <Check className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setIsEditingCity(false)} className="p-1 text-muted-foreground hover:bg-muted rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <div className="text-lg font-serif font-semibold text-white/80">
                      {weather.city}
                    </div>
                    <button 
                      onClick={() => { setCityInput(weather.city); setIsEditingCity(true); }}
                      className="p-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary rounded-md hover:bg-primary/10"
                      title="Change city"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-white/90 font-medium">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> {weather.humidity}%
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5" /> {weather.windSpeedKph} km/h
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Sports Section */}
      {showSports && (
        <div className="p-5 flex flex-col w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider">Live Sports</h3>
            
            {!sportsLoading && hasAnySports && (
              <div className="flex gap-2">
                {SPORTS_TABS.map(sport => {
                  if (sportsData[sport] === null) return null;
                  return (
                    <button
                      key={sport}
                      onClick={() => setActiveSportTab(sport)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors capitalize ${
                        activeSportTab === sport 
                          ? 'bg-white/[0.1] text-white border border-white/[0.15]' 
                          : 'bg-white/[0.2] text-white/90 border border-transparent hover:text-white/80 hover:bg-white/[0.15]'
                      }`}
                    >
                      {sport}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {sportsLoading ? (
            <div className="space-y-3 flex-1">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ) : activeSportTab && sportsData[activeSportTab] ? (
            <div className="flex-1 space-y-2">
              {sportsData[activeSportTab]!.length > 0 ? (
                sportsData[activeSportTab]!.map((match, i) => (
                  <div key={match.id || i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.15] border border-white/[0.1] text-sm hover:bg-white/[0.1] transition-colors">
                    <div className="flex-1 font-medium text-white/80 truncate pr-2">
                      {match.home || 'TBA'}
                    </div>
                    
                    <div className="flex flex-col items-center justify-center px-4 min-w-[80px]">
                      <div className="font-serif font-bold text-white/95 text-lg tracking-tight whitespace-nowrap">
                        {match.home_score !== null && match.home_score !== undefined ? match.home_score : '-'} 
                        <span className="mx-1 text-white font-normal">:</span> 
                        {match.away_score !== null && match.away_score !== undefined ? match.away_score : '-'}
                      </div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${
                        (match.status_text || match.status)?.toLowerCase().includes('live') || (match.status_text || match.status)?.toLowerCase().includes('play')
                          ? 'text-rose-500 animate-pulse'
                          : 'text-muted-foreground'
                      }`}>
                        {match.status_text || match.status || (match.time ? new Date(match.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled')}
                      </div>
                    </div>

                    <div className="flex-1 font-medium text-white/80 text-right truncate pl-2">
                      {match.away || 'TBA'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm font-medium">
                  No live matches at the moment.
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-4 text-right">
            <span className="text-white text-[11px]">
              Powered by <a href="https://sportscore.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline decoration-white/20 underline-offset-2">SportScore</a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
