// Temporary basic routes while developing UI
import { TRoute } from './Types'
import Dashboard from './Pages/Dashboard'
import Library from './components/Library'
import OperationView from './Pages/OperationView'
import OperationOverview from './Pages/OperationOverview'
import OperationCreate from './Pages/OperationCreate'

const Routes: Array<TRoute> = [
  { path: '', heading: 'Dashboard', content: Dashboard },
  {
    path: '/library',
    heading: 'Library',
    content: Library,
  },
  {
    path: '/operation/:data_source/:entity_id',
    heading: 'Operation details',
    content: OperationView,
  },
  {
    path: '/operation/new',
    heading: 'Create new operation',
    content: OperationCreate,
  },
  {
    path: '/operation',
    heading: 'Operations',
    content: OperationOverview,
  },
  {
    path: '/operation#draft',
    heading: 'Operation drafts',
    content: OperationOverview,
  },
  {
    path: '/operation#ongoing',
    heading: 'Ongoing operations',
    content: OperationOverview,
  },
  {
    path: '/operation#concluded',
    heading: 'Completed operations',
    content: OperationOverview,
  },
]

export default Routes
