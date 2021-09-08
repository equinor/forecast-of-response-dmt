import React from 'react'
import { Label, Search } from '@equinor/eds-core-react'
import styled from 'styled-components'

const Div = styled.div``

export const SearchInput = (props: {
  placeholder?: string
  onChange: Function
}): JSX.Element => {
  const { placeholder, onChange } = props
  return (
    <>
      <Div>
        <Label label="Search by operation name" />
        <Search
          aria-label="operations"
          id="search-operations"
          placeholder={placeholder || 'Search'}
          onChange={onChange}
        />
      </Div>
    </>
  )
}
