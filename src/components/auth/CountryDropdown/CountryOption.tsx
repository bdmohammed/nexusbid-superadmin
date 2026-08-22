interface CountryOptionProps {
  country: string;
  selectedValue: string;
  onClick: () => void;
}

export default function CountryOption({
  country,
  selectedValue,
  onClick,
}: CountryOptionProps) {
  const isSelected = selectedValue === country;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--surface-secondary)] transition-colors ${
        isSelected
          ? "bg-[#003EC7]/10 text-[#003EC7] font-semibold"
          : "text-[var(--foreground)]"
      }`}
    >
      {country}
    </button>
  );
}
