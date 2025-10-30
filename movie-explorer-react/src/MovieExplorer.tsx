import React, { useEffect, useMemo, useState } from "react";

const BASE_URL = "https://api.themoviedb.org/3" as const;
const IMG_URL = "https://image.tmdb.org/t/p/w500" as const;
const API_KEY = "f396ea26e6f21b75d092d12c7a306607" as const;

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
}

type SortBy =
  | "release_date.desc"
  | "release_date.asc"
  | "vote_average.asc"
  | "vote_average.desc";

function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function MovieExplorer() {
  const resolvedKey = useMemo<string>(() => API_KEY, []);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [rawQuery, setRawQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("release_date.desc");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const query = useDebouncedValue<string>(rawQuery, 500);

  const requestUrl = useMemo<string>(() => {
    const base = query
      ? `${BASE_URL}/search/movie?api_key=${resolvedKey}&query=${encodeURIComponent(query)}`
      : `${BASE_URL}/discover/movie?api_key=${resolvedKey}&sort_by=${encodeURIComponent(sortBy)}`;
    return `${base}&page=${page}`;
  }, [query, sortBy, page, resolvedKey]);

  useEffect(() => {
    let cancelled = false;
    async function fetchMovies() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(requestUrl);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data: { results?: Movie[] } = await res.json();
        if (!cancelled) setMovies(Array.isArray(data.results) ? data.results : []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMovies();
    return () => {
      cancelled = true;
    };
  }, [requestUrl]);

  const onChangePage = (delta: number) => setPage((p) => Math.max(1, p + delta));
  const onChangeSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy);
    setPage(1);
  };
  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawQuery(e.target.value.trimStart());
    setPage(1);
  };

  return (
    <div>
      <header>
        <h1>Movie Explorer</h1>
      </header>
      <div className="search-bar-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for a movie..."
            value={rawQuery}
            onChange={onChangeSearch}
            aria-label="Search movies"
          />
          <select value={sortBy} onChange={onChangeSort} aria-label="Sort movies">
            <option value="release_date.desc">Sort By</option>
            <option value="release_date.asc">Release Date (Asc)</option>
            <option value="vote_average.asc">Rating (Asc)</option>
            <option value="vote_average.desc">Rating (Desc)</option>
          </select>
        </div>
      </div>
      <main id="movie-container">
        {loading && <p style={{ color: "white" }}>Loading…</p>}
        {error && !loading && <p style={{ color: "#ffdddd" }}>{error}</p>}
        {!loading && !error && movies.length === 0 && (
          <p style={{ color: "white" }}>No movies found.</p>
        )}
        <div id="movie-grid" style={{ display: "contents" }}>
          {movies.map((movie) => (
            <div className="movie" key={movie.id}>
              {movie.poster_path ? (
                <img
                  src={`${IMG_URL}${movie.poster_path}`}
                  alt={movie.title || "Movie poster"}
                  loading="lazy"
                />
              ) : (
                <div
                  style={{
                    height: 300,
                    borderRadius: 10,
                    background: "#e9eef5",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 600,
                  }}
                >
                  No Image
                </div>
              )}
              <h3>{movie.title}</h3>
              <p>Release Date: {movie.release_date || "N/A"}</p>
              <p>
                Rating:{" "}
                {typeof movie.vote_average === "number"
                  ? movie.vote_average.toFixed(1)
                  : "N/A"}
              </p>
            </div>
          ))}
        </div>
      </main>
      <div className="pagination">
        <button onClick={() => onChangePage(-1)} disabled={page === 1}>
          Previous Page
        </button>
        <span id="page-number">Page {page}</span>
        <button onClick={() => onChangePage(1)}>Next Page</button>
      </div>
    </div>
  );
}
