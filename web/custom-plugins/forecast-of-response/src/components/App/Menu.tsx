import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { CreateOperationButton } from '../Operations/CreateOperationButton'
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
        <SubMenu
          key="sub1"
          icon={<Icon name="library" size={24} />}
          title="Library"
        >
          <Menu.Item key="2">
            <Link to={`/${appRootPath}/library#weather`}>Weather forecast</Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to={`/${appRootPath}/library#stask`}>Stask</Link>
          </Menu.Item>
        </SubMenu>
        <Menu.Item key="4" icon={<Icon name="list" size={24} />}>
          <Link to={`/${appRootPath}/operations`}>Operation overview</Link>
        </Menu.Item>
        <SubMenu
          key="sub2"
          icon={<Icon name="person" size={24} />}
          title="My operations"
        >
          <Menu.Item key="5">
            <Link to={`/${appRootPath}/operations#draft`}>Drafts</Link>
          </Menu.Item>
          <Menu.Item key="6">
            <Link to={`/${appRootPath}/operations#ongoing`}>Active</Link>
          </Menu.Item>
          <Menu.Item key="7">
            <Link to={`/${appRootPath}/operations#concluded`}>Completed</Link>
          </Menu.Item>
          <Menu.Item key="8">
            <CreateOperationButton appRootPath={appRootPath} />
          </Menu.Item>
        </SubMenu>
      </Menu>
    </Sider>
  )
}
