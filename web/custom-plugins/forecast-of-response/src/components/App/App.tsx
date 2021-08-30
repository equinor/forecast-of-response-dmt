import React from 'react'
import { Route } from 'react-router-dom'
import { Layout } from 'antd'

import Header from './Header'
import Menu from './Menu'
import Content from './Content'
import { backgroundColorDefault } from '../Design/Colors'
import { TApp, TLayout } from '../../Types'
import Routes from './Routes'

const MainLayout = (props: TLayout) => {
  const { heading, content, settings } = props
  return (
    <>
      <Header appName={settings.label} />
      <Layout style={{ background: backgroundColorDefault }}>
        <Menu appRootPath={settings.name} />
        <Content settings={settings} heading={heading} content={content} />
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
            <MainLayout
              heading={route.heading}
              content={route.content}
              settings={settings}
            />
          )}
          key={route.path}
        />
      ))}
    </>
  )
}