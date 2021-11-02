import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import Icon from '../Design/Icons'
import './Menu.css'

const { Sider } = Layout
const { SubMenu } = Menu

export default (props: { appRootPath: string }): JSX.Element => {
  const { appRootPath } = props
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(
    location.state?.menuCollapsed === undefined
      ? false
      : location.state.menuCollapsed
  )
  const iconSize: 24 | 16 | 32 | 40 | 48 | undefined = 24
  const menuUrl: string[] = [
    `/${appRootPath}`,
    `/${appRootPath}/library`,
    `/${appRootPath}/operations`,
  ]
  return (
    <Sider
      theme="light"
      width="250"
      collapsible
      collapsed={collapsed}
      onCollapse={(collapsed: boolean) => setCollapsed(collapsed)}
    >
      <Menu
        theme="light"
        defaultSelectedKeys={[location.pathname]}
        mode="inline"
      >
        <Menu.Item key={menuUrl[0]} icon={<Icon name="home" size={iconSize} />}>
          <Link
            to={{ pathname: menuUrl[0], state: { menuCollapsed: collapsed } }}
          >
            Dashboard
          </Link>
        </Menu.Item>
        {/*<SubMenu*/}
        {/*  key="sub1"*/}
        {/*  icon={<Icon name="library" size={24} />}*/}
        {/*  title="Library"*/}
        {/*>*/}
        <Menu.Item
          key={menuUrl[1]}
          icon={<Icon name="library" size={iconSize} />}
        >
          <Link
            to={{ pathname: menuUrl[1], state: { menuCollapsed: collapsed } }}
          >
            Stask Library
          </Link>
        </Menu.Item>
        {/*</SubMenu>*/}
        <Menu.Item key={menuUrl[2]} icon={<Icon name="list" size={iconSize} />}>
          <Link
            to={{ pathname: menuUrl[2], state: { menuCollapsed: collapsed } }}
          >
            Operation overview
          </Link>
        </Menu.Item>
      </Menu>
    </Sider>
  )
}
