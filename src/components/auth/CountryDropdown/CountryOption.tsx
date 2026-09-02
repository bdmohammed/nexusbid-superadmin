interface CountryOptionProps {
  countryId: string | number;
  countryName: string;
  selectedId: string;
  onClick: (id: string | number) => void;
}

export default function CountryOption({
  countryId,
  countryName,
  selectedId,
  onClick,
}: CountryOptionProps) {
  const isSelected = String(selectedId) === String(countryId);

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={() => onClick(countryId)}
      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--surface-secondary)] transition-colors ${
        isSelected ? 'bg-[#003EC7]/10 text-[#003EC7] font-semibold' : 'text-[var(--foreground)]'
      }`}
    >
      {countryName}
    </button>
  );
}
