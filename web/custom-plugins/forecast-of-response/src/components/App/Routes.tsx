import { TRoute } from '../../Types'
import Dashboard from '../Dashboard'
import Library from '../Library'
import OperationDetails from '../Operations/OperationDetails'
import OperationCreate from '../Operations/OperationCreate'
import OperationOverview from '../Operations/OperationOverview'

// Temporary basic routes while developing UI
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
    content: OperationDetails,
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
