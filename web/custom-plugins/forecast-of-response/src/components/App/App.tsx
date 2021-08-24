import React from 'react'
import { Route } from 'react-router-dom'
import { Layout } from 'antd'

import AppHeader from './AppHeader'
import AppMenu from './AppMenu'
import AppContent from './AppContent'
import { backgroundColorDefault } from '../Colors'
import { TApp, TMainLayout } from '../../Types'
import Routes from './Routes'

const MainLayout = (props: TMainLayout) => {
  const { content, settings } = props
  return (
    <>
      <AppHeader appName={settings.label} />
      <Layout
        style={{ margin: '10px 10px 0', background: backgroundColorDefault }}
      >
        <AppMenu appRootPath={settings.name} />
        <AppContent settings={settings} content={content} />
      </Layout>
    </>
  )
}

export default (props: TApp): JSX.Element => {
  const { settings } = props

  return (
    <>
      {Routes.map((route) => (
        <Route
          exact
          path={`/${settings.name}${route.path}`}
          render={() => (
            <MainLayout content={route.content} settings={settings} />
          )}
          key={route.path}
        />
      ))}
    </>
  )
}
