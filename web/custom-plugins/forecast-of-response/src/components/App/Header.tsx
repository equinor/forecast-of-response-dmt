import React, { useContext, useState } from 'react'
import { Button, Scrim, TopBar } from '@equinor/eds-core-react'
import styled from 'styled-components'
import Icon from '../Design/Icons'
import { AuthContext } from 'react-oauth2-code-pkce'

const Icons = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  > * {
    margin-left: 40px;
  }
`

const ClickableIcon = styled.div`
  &:hover {
    color: gray;
    cursor: pointer;
  }
`

export default (props: { appName: string }): JSX.Element => {
  const { appName } = props
  const [visibleUserInfo, setVisibleUserInfo] = useState<boolean>(false)
  const { tokenData } = useContext(AuthContext)
  return (
    <TopBar>
      <TopBar.Header>
        <Icon name="waves" size={24} />
        {appName}
      </TopBar.Header>
      <TopBar.Actions>
        <Icons>
          <ClickableIcon onClick={() => setVisibleUserInfo(true)}>
            <Icon name="account_circle" size={24} title="user" />
          </ClickableIcon>
          <Icon name="notifications" size={24} title="notifications" />
        </Icons>
      </TopBar.Actions>
      {visibleUserInfo && (
        <Scrim onClose={() => setVisibleUserInfo(false)} isDismissable>
          <div
            style={{
              backgroundColor: '#fff',
              padding: '1rem',
              maxWidth: '600px',
            }}
          >
            <pre style={{ whiteSpace: 'pre-line' }}>
              {JSON.stringify(tokenData || '', null, 2)}
            </pre>
            <Button onClick={() => setVisibleUserInfo(false)}>Close</Button>
          </div>
        </Scrim>
      )}
    </TopBar>
  )
}
