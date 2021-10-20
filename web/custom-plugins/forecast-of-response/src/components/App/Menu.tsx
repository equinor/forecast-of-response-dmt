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

  return (
    <Sider
      theme="light"
      width="250"
      collapsible
      collapsed={collapsed}
      onCollapse={(collapsed: boolean) => setCollapsed(collapsed)}
    >
      <Menu theme="light" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<Icon name="home" size={24} />}>
          <Link to={`/${appRootPath}`}>Dashboard</Link>
        </Menu.Item>
        {/*<SubMenu*/}
        {/*  key="sub1"*/}
        {/*  icon={<Icon name="library" size={24} />}*/}
        {/*  title="Library"*/}
        {/*>*/}
        <Menu.Item key="3">
          <Link to={`/${appRootPath}/library`}>Stask Library</Link>
        </Menu.Item>
        {/*</SubMenu>*/}
        <Menu.Item key="4" icon={<Icon name="list" size={24} />}>
          <Link to={`/${appRootPath}/operation`}>Operation overview</Link>
        </Menu.Item>
        {/*<SubMenu*/}
        {/*  key="sub2"*/}
        {/*  icon={<Icon name="person" size={24} />}*/}
        {/*  title="My operations"*/}
        {/*>*/}
        {/*<Menu.Item key="6">*/}
        {/*  <Link to={`/${appRootPath}/operation#ongoing`}>*/}
        {/*    Active operations*/}
        {/*  </Link>*/}
        {/*</Menu.Item>*/}
        {/*<Menu.Item key="5">*/}
        {/*  <Link to={`/${appRootPath}/operation#draft`}>Operation drafts</Link>*/}
        {/*</Menu.Item>*/}
        {/*<Menu.Item key="7">*/}
        {/*  <Link to={`/${appRootPath}/operation#concluded`}>*/}
        {/*    Completed operation*/}
        {/*  </Link>*/}
        {/*</Menu.Item>*/}
        <Menu.Item key="8">
          <Link to={`/${appRootPath}/operation/new`}>
            <Button>Create new operation</Button>
          </Link>
        </Menu.Item>
        {/*</SubMenu>*/}
      </Menu>
    </Sider>
  )
}
