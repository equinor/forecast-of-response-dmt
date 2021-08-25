import * as React from 'react'

import { DmtPluginType } from '@dmt/core-plugins'
import Operation from './components/Operation'
import OperationsTable from './components/OperationsTable'
import EditOperation from './components/EditOperation'

export const plugins: any = [
  {
    pluginName: 'for-operation',
    pluginType: DmtPluginType.UI,
    content: {
      component: Operation,
    },
  },
  {
    pluginName: 'for-operation-edit',
    pluginType: DmtPluginType.UI,
    content: {
      component: EditOperation,
    },
  },
  {
    pluginName: 'for-operations-table',
    pluginType: DmtPluginType.UI,
    content: {
      component: OperationsTable,
    },
  },
]
