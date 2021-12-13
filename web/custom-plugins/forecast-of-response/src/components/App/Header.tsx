import React, { useContext, useState } from 'react'
import { Button, Scrim, TopBar } from '@equinor/eds-core-react'
import styled from 'styled-components'
import Icon from '../Design/Icons'
import { Link } from 'react-router-dom'
import { AuthContext } from '@dmt/common'

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

const StyledLink = styled(Link)`
  text-decoration: none;
  color: black;
  &:focus,
  &:hover {
    text-decoration: none;
    color: black;
  }
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`

export default (props: { appName: string }): JSX.Element => {
  const { appName } = props
  const [visibleUserInfo, setVisibleUserInfo] = useState<boolean>(false)
  const { tokenData } = useContext(AuthContext)
  return (
    <TopBar>
      <TopBar.Header>
        <StyledLink
          style={{ display: 'flex' }}
          to={{
            pathname: `/for`,
          }}
        >
          <Icon name="waves" size={32} />
          <h4 style={{ paddingTop: 9, paddingLeft: 10 }}>{appName}</h4>
        </StyledLink>
      </TopBar.Header>
      <TopBar.Actions>
        <Icons>
          <ClickableIcon onClick={() => setVisibleUserInfo(true)}>
            <Icon name="account_circle" size={24} title="user" />
          </ClickableIcon>
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
