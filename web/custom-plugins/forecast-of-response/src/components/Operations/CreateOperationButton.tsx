import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@equinor/eds-core-react'
import Icon from '../Design/Icons'

export const CreateOperationButton = (props: {
  appRootPath: string
}): JSX.Element => {
  const { appRootPath } = props
  // Should use EdsProvider to set scale, but it will not work.
  //<Icon name="add_circle_outlined" title="add" size={16} />
  return (
    //<EdsProvider density="compact">
    <>
      <Link to={`/${appRootPath}/operations/new`}>
        <Button>Create new operation</Button>
      </Link>
    </>
  )
}
