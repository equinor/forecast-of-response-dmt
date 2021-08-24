import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { Button } from '@equinor/eds-core-react'
import { TAppMenu } from '../../Types'
import Icon from '../Icons'
import './AppMenu.css'

const { Sider } = Layout
const { SubMenu } = Menu

const CreateOperationButton = () => {
  return (
    //<EdsProvider density="compact">
    // Should use EdsProvider to set scale, but it will not work.
    //<Icon name="add_circle_outlined" title="add" size={16} />
    <Button>Create new operation</Button>
    //</EdsProvider>
  )
}

export default (props: TAppMenu): JSX.Element => {
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
            <Link to={`/${appRootPath}/library/weather`}>Weather forecast</Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to={`/${appRootPath}/library/stask`}>Stask</Link>
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
            <Link to={`/${appRootPath}/operations/drafts`}>Drafts</Link>
          </Menu.Item>
          <Menu.Item key="6">
            <Link to={`/${appRootPath}/operations/ongoing`}>Active</Link>
          </Menu.Item>
          <Menu.Item key="7">
            <Link to={`/${appRootPath}/operations/done`}>Completed</Link>
          </Menu.Item>
          <Menu.Item key="8">
            <Link to={`/${appRootPath}/operations/new`}>
              {<CreateOperationButton />}
            </Link>
          </Menu.Item>
        </SubMenu>
      </Menu>
    </Sider>
  )
}
