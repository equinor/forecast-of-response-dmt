import React from 'react'
import { DmtPluginType } from '@dmt/core-plugins'

import App from './App'

export const plugins: any = [
  {
    pluginName: 'for',
    pluginType: DmtPluginType.PAGE,
    content: {
      component: App,
    },
  },
]
