import React from 'react'
import { Layout } from 'antd'
import styled from 'styled-components'

import { TContent } from '../../Types'
import { backgroundColorLight } from '../Colors'

const { Content } = Layout

const PageContent = styled.div`
  padding: 20px;
  background-color: ${backgroundColorLight};
`

export default (props: TContent): JSX.Element => {
  const { content } = props

  return (
    <Content style={{ margin: '4px 0px 10px 0px' }}>
      <PageContent>{content}</PageContent>
    </Content>
  )
}
