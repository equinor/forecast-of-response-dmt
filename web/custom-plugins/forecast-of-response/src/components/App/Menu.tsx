import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@equinor/eds-core-react'
import { Layout, Menu } from 'antd'
import Icon from '../Design/Icons'
import './Menu.css'

const { Sider } = Layout
const { SubMenu } = Menu

export default (props: { appRootPath: string }): JSX.Element => {
  const { appRootPath } = props
  const [collapsed, setCollapsed] = useState(false)
  const iconSize: 24 | 16 | 32 | 40 | 48 | undefined = 24

  return (
    <Sider
      theme="light"
      width="250"
      collapsible
      collapsed={collapsed}
      onCollapse={(collapsed: boolean) => setCollapsed(collapsed)}
    >
      <Menu theme="light" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<Icon name="home" size={iconSize} />}>
          <Link to={`/${appRootPath}`}>Dashboard</Link>
        </Menu.Item>
        {/*<SubMenu*/}
        {/*  key="sub1"*/}
        {/*  icon={<Icon name="library" size={24} />}*/}
        {/*  title="Library"*/}
        {/*>*/}
        <Menu.Item key="3" icon={<Icon name="library" size={iconSize} />}>
          <Link to={`/${appRootPath}/library`}>Stask Library</Link>
        </Menu.Item>
        {/*</SubMenu>*/}
        <Menu.Item key="4" icon={<Icon name="list" size={iconSize} />}>
          <Link to={`/${appRootPath}/operations`}>Operation overview</Link>
        </Menu.Item>
        {/*<Menu.Item key="8">*/}
        {/*  <Link to={`/${appRootPath}/operations/new`}>*/}
        {/*    <Button>Create new operation</Button>*/}
        {/*  </Link>*/}
        {/*</Menu.Item>*/}
        {/*</SubMenu>*/}
      </Menu>
    </Sider>
  )
}
