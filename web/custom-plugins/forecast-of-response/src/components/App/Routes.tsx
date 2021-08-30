import { TRoute } from '../../Types'
import { Dashboard } from '../Dashboard'
import { Library } from '../Library'
import { Operations, OperationsCreate } from '../Operations'

// Temporary basic routes while developing UI
const Routes: Array<TRoute> = [
  { path: '', heading: 'Dashboard', content: Dashboard },
  {
    path: '/library',
    heading: 'Library',
    content: Library,
  },
  {
    path: '/operations',
    heading: 'Operations',
    content: Operations,
    // TODO: Consider more dynamic approach, e.g.
    //content: (<UIPlugin
    // name='OperationsOverview'
    // uiRecipe='operations-overview'
    // type='ForecastDS/ForecastOfResponse/Blueprints/Operation'
    // />)
  },
  {
    path: '/operations#draft',
    heading: 'Operation drafts',
    content: Operations,
  },
  {
    path: '/operations#ongoing',
    heading: 'Ongoing operations',
    content: Operations,
  },
  {
    path: '/operations#concluded',
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
