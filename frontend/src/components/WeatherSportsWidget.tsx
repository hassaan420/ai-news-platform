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
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle, 
  Thermometer, 
  Wind,
  Droplets,
  Edit2,
  Check,
  X
} from 'lucide-react';

const DEFAULT_CITY = "Islamabad";
const GEOLOCATION_TIMEOUT_MS = 5000;
const SPORTS_POLL_INTERVAL_MS = 60000;
const SPORTS_TABS = ['football', 'cricket', 'tennis'] as const;

type SportType = typeof SPORTS_TABS[number];

// Simple icon lookup for OpenWeatherMap codes
const getWeatherIcon = (iconCode: string) => {
  const code = iconCode.substring(0, 2);
  switch (code) {
    case '01': return <Sun className="w-10 h-10 text-amber-500" aria-label="Clear sky" />;
    case '02': 
    case '03': 
    case '04': return <Cloud className="w-10 h-10 text-slate-400" aria-label="Clouds" />;
    case '09': return <CloudDrizzle className="w-10 h-10 text-blue-400" aria-label="Drizzle" />;
    case '10': return <CloudRain className="w-10 h-10 text-blue-500" aria-label="Rain" />;
    case '11': return <CloudLightning className="w-10 h-10 text-indigo-500" aria-label="Thunderstorm" />;
    case '13': return <CloudSnow className="w-10 h-10 text-sky-200" aria-label="Snow" />;
    case '50': return <Wind className="w-10 h-10 text-slate-300" aria-label="Mist" />;
    default: return <Thermometer className="w-10 h-10 text-muted-foreground" aria-label="Weather" />;
  }
};

export default function WeatherSportsWidget() {
  // Weather State
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [customCity, setCustomCity] = useState(DEFAULT_CITY);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState("");

  // Sports State
  const [sportsData, setSportsData] = useState<Record<SportType, SportMatch[] | null>>({
    football: null,
    cricket: null,
    tennis: null
  });
  const [sportsLoading, setSportsLoading] = useState(true);
  const [activeSportTab, setActiveSportTab] = useState<SportType | null>(null);

  useEffect(() => {
    let isMounted = true;

    // --- Weather Fetch ---
    const fetchWeather = async (lat?: number, lon?: number, cityStr?: string) => {
      try {
        setWeatherLoading(true);
        let data;
        if (lat !== undefined && lon !== undefined) {
          data = await weatherApi.getCurrentWeatherByCoordinates(lat, lon);
        } else {
          data = await weatherApi.getCurrentWeatherByCity(cityStr || customCity);
        }
        if (isMounted) {
          setWeather(data);
          setWeatherError(false);
          if (data && data.city) {
            setCustomCity(data.city);
          }
        }
      } catch (error) {
        console.debug("Failed to fetch weather data:", error);
        if (isMounted) setWeatherError(true);
      } finally {
        if (isMounted) setWeatherLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.debug("Geolocation error/denied:", error);
          fetchWeather();
        },
        { timeout: GEOLOCATION_TIMEOUT_MS }
      );
    } else {
      fetchWeather();
    }

    // --- Sports Fetch ---
    const fetchSports = async () => {
      try {
        const results = await Promise.allSettled(
          SPORTS_TABS.map(sport => sportsApi.getLiveMatches(sport))
        );

        if (!isMounted) return;

        const newSportsData: Record<SportType, SportMatch[] | null> = { ...sportsData };
        let firstSuccessfulTab: SportType | null = null;

        results.forEach((result, index) => {
          const sport = SPORTS_TABS[index];
          if (result.status === 'fulfilled' && result.value?.matches) {
            newSportsData[sport] = result.value.matches;
            if (!firstSuccessfulTab) firstSuccessfulTab = sport;
          } else {
            console.debug(`Failed to fetch sports data for ${sport}:`, result);
            newSportsData[sport] = null;
          }
        });

        setSportsData(newSportsData);
        setActiveSportTab(prev => {
          // If current tab is null or its data failed, switch to the first successful one
          if (!prev || newSportsData[prev] === null) {
            return firstSuccessfulTab;
          }
          return prev;
        });

      } catch (error) {
        console.debug("Unexpected error during sports fetch:", error);
      } finally {
        if (isMounted) setSportsLoading(false);
      }
    };

    fetchSports();
    const intervalId = setInterval(fetchSports, SPORTS_POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleCitySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cityInput.trim()) {
      setCustomCity(cityInput.trim());
      setIsEditingCity(false);
      
      const doFetch = async () => {
        try {
          setWeatherLoading(true);
          const data = await weatherApi.getCurrentWeatherByCity(cityInput.trim());
          setWeather(data);
          setWeatherError(false);
          if (data && data.city) {
            setCustomCity(data.city);
          }
        } catch (error) {
          console.debug("Failed to fetch custom city weather:", error);
          setWeatherError(true);
        } finally {
          setWeatherLoading(false);
        }
      };
      doFetch();
    }
  };

  const hasAnySports = Object.values(sportsData).some(data => data !== null);
  const showWeather = weatherLoading || (!weatherError && weather !== null);
  const showSports = sportsLoading || hasAnySports;

  // If both failed/empty, render nothing
  if (!showWeather && !showSports) {
    return null;
  }

  return (
    <div className="bg-card border border-border shadow-subtle rounded-xl overflow-hidden flex flex-col w-full mb-8">
      {/* Weather Section */}
      {showWeather && (
        <div className={`p-5 flex flex-col justify-center ${showSports ? 'border-b border-border' : ''}`}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Local Weather</h3>
          
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
                  <div className="text-3xl font-bold text-foreground">
                    {Math.round(weather.temperatureCelsius)}°
                  </div>
                  <div className="text-sm font-medium text-foreground capitalize">
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
                    <div className="text-lg font-semibold text-foreground">
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
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground font-medium">
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
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Sports</h3>
            
            {!sportsLoading && hasAnySports && (
              <div className="flex gap-2">
                {SPORTS_TABS.map(sport => {
                  if (sportsData[sport] === null) return null;
                  return (
                    <button
                      key={sport}
                      onClick={() => setActiveSportTab(sport)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize ${
                        activeSportTab === sport 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
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
                sportsData[activeSportTab]!.slice(0, 5).map((match, i) => (
                  <div key={match.id || i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
                    <div className="flex-1 font-medium text-foreground truncate pr-2">
                      {match.home || 'TBA'}
                    </div>
                    
                    <div className="flex flex-col items-center justify-center px-4 min-w-[80px]">
                      <div className="font-bold text-foreground text-base tracking-tight whitespace-nowrap">
                        {match.home_score !== null && match.home_score !== undefined ? match.home_score : '-'} 
                        <span className="mx-1 text-muted-foreground font-normal">:</span> 
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

                    <div className="flex-1 font-medium text-foreground text-right truncate pl-2">
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
            <span className="text-muted-foreground text-xs">
              Powered by <a href="https://sportscore.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline decoration-border underline-offset-2">SportScore</a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
