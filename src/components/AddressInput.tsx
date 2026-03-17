interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  city?: string;
  placeholder?: string;
  className?: string;
  error?: string;
}

const AddressInput = ({ value, onChange, placeholder, className, error }: AddressInputProps) => (
  <div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default AddressInput;
