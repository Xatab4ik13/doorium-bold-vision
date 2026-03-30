import { useState, useRef, useEffect, useCallback } from "react";

const DADATA_API_KEY = "ae4c191b51dc48a6f7bf268fba3df539ece489d4";
const DADATA_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

interface Suggestion {
  value: string;
  unrestricted_value: string;
  data: Record<string, any>;
}

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  city?: string;
  placeholder?: string;
  className?: string;
  error?: string;
}

const AddressInput = ({ value, onChange, city, placeholder, className, error }: AddressInputProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim() || !DADATA_API_KEY) {
        setSuggestions([]);
        return;
      }

      try {
        const body: Record<string, any> = { query, count: 7 };

        // Restrict to selected city if provided
        if (city) {
          body.locations = [{ city }];
        }

        const res = await fetch(DADATA_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${DADATA_API_KEY}`,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setOpen(true);
        setActiveIdx(-1);
      } catch {
        // silent
      }
    },
    [city]
  );

  const handleChange = (val: string) => {
    onChange(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const handleSelect = (s: Suggestion) => {
    onChange(s.value);
    setOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-popover shadow-xl text-sm">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`px-4 py-2.5 cursor-pointer transition-colors ${
                i === activeIdx
                  ? "bg-accent text-accent-foreground"
                  : "text-popover-foreground hover:bg-accent/50"
              }`}
            >
              {s.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressInput;
