import { TRoute } from '../../Types'
import { Dashboard } from '../Dashboard'
import { WeatherForecast, Stask } from '../Library'
import { Operations, OperationsCreate } from '../Operations'

// Temporary basic routes while developing UI
const Routes: Array<TRoute> = [
  { path: '', heading: 'Dashboard', content: Dashboard },
  {
    path: '/library/weather',
    heading: 'Weather forecast',
    content: WeatherForecast,
  },
  { path: '/library/stask', heading: 'Stask', content: Stask },
  {
    path: '/operations',
    heading: 'Operations',
    content: Operations,
  },
  {
    path: '/operations#drafts',
    heading: 'Operation drafts',
    content: Operations,
  },
  {
    path: '/operations#ongoing',
    heading: 'Ongoing operations',
    content: Operations,
  },
  {
    path: '/operations#completed',
    heading: 'Completed operations',
    content: Operations,
  },
  {
    path: '/operations/new',
    heading: 'Create new operation',
    content: OperationsCreate,
  },
]

export default Routes
