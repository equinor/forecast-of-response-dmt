import { TRoute } from '../../Types'

// Temporary basic routes while developing UI
const Routes: Array<TRoute> = [
  { path: '', content: 'dashboard' },
  { path: '/library/weather', content: 'weather forecast: cold and rainy' },
  { path: '/library/stask', content: 'stask lives here' },
  {
    path: '/operations',
    content: '<ul><li>operation 1</li><li>operation 2</li></ul>',
  },
  { path: '/operations/drafts', content: 'drafts live here' },
  { path: '/operations/ongoing', content: 'ongoing operations' },
  { path: '/operations/done', content: 'completed operations' },
  { path: '/operations/new', content: 'create a new operation here' },
]

export default Routes
