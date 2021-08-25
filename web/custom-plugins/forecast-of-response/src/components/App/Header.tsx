import React, { useState } from 'react'
import { TopBar } from '@equinor/eds-core-react'
import styled from 'styled-components'
import Icon from '../Icons'

const Icons = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  > * {
    margin-left: 40px;
  }
`

export default (props: { appName: string }): JSX.Element => {
  const { appName } = props
  return (
    <TopBar>
      <TopBar.Header>
        <Icon name="waves" size={24} />
        {appName}
      </TopBar.Header>
      <TopBar.Actions>
        <Icons>
          <Icon name="account_circle" size={24} title="user" />
          <Icon name="notifications" size={24} title="notifications" />
        </Icons>
      </TopBar.Actions>
    </TopBar>
  )
}
