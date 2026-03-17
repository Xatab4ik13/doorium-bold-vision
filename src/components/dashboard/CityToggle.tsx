import { MapPin } from "lucide-react";

export type CityFilter = string;

interface Props {
  value: CityFilter;
  onChange: (city: CityFilter) => void;
}

const cities = ["Москва", "СПб"];

const CityToggle = ({ value, onChange }: Props) => {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
      {cities.map((city) => (
        <button
          key={city}
          onClick={() => onChange(city)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === city ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          {city}
        </button>
      ))}
    </div>
  );
};

export default CityToggle;
