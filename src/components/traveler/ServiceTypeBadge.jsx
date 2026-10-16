export const SERVICE_TYPE_OPTIONS = [
  {
    value: 'fully_accompanied',
    label: 'Fully accompanied',
    description: 'I stay with the traveller for the whole trip (travel, meals, activities)',
  },
  {
    value: 'guiding_only',
    label: 'Guiding only',
    description: 'I guide tours and sightseeing, the traveller handles everything else',
  },
  {
    value: 'both',
    label: 'Both',
    description: 'The traveller can choose',
  },
];

export function getServiceType(value) {
  return SERVICE_TYPE_OPTIONS.find(o => o.value === value) || null;
}

export default function ServiceTypeBadge({ type }) {
  const meta = getServiceType(type);
  if (!meta) return null;
  return <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">{meta.label}</span>;
}