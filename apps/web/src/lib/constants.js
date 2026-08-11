export const ASSET_CATEGORIES = [
  { value: 'livestock', label: 'Livestock' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'facility', label: 'Facility' },
  { value: 'aquaculture', label: 'Aquaculture' },
  { value: 'crop-block', label: 'Crop Block' }
];

export const ASSET_STATUSES = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'attention', label: 'Needs Attention' },
  { value: 'critical', label: 'Critical' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Inactive' }
];

export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

export const SEVERITIES = ['info', 'warning', 'critical'];

export const FARM_TYPES = [
  'Cattle',
  'Poultry',
  'Dairy',
  'Goat & Sheep',
  'Aquaculture',
  'Crop',
  'Mixed Farm'
];

export const METRICS = [
  { value: 'temperature', label: 'Temperature', unit: '°C' },
  { value: 'humidity', label: 'Humidity', unit: '%' },
  { value: 'feed-level', label: 'Feed Level', unit: '%' },
  { value: 'water-level', label: 'Water Level', unit: '%' },
  { value: 'heart-rate', label: 'Heart Rate', unit: 'bpm' },
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'fuel-level', label: 'Fuel Level', unit: '%' },
  { value: 'runtime', label: 'Runtime', unit: 'h' },
  { value: 'ph', label: 'pH', unit: 'pH' },
  { value: 'dissolved-oxygen', label: 'Dissolved Oxygen', unit: 'mg/L' }
];

export const ROLE_LABELS = {
  owner: 'Owner',
  manager: 'Manager',
  operator: 'Operator',
  viewer: 'Viewer'
};
