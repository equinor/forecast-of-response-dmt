import React from 'react'
import { Layout } from 'antd'
import styled from 'styled-components'

import { TAppContent } from '../../Types'
import { backgroundColorLight } from '../Colors'

const { Content } = Layout

const PageContent = styled.div`
  padding: 20px;
  background-color: ${backgroundColorLight};
`

export default (props: TAppContent): JSX.Element => {
  const { content } = props

  return (
    <Content style={{ margin: '5px 10px 0' }}>
      <PageContent>{content}</PageContent>
    </Content>
  )
}
