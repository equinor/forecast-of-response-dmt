import React, { useState } from 'react'
import { Search } from '@equinor/eds-core-react'

export const SearchInput = (props: {
  placeholder?: string
  onChange: any
}): JSX.Element => {
  const { placeholder, onChange } = props
  return (
    <>
      <div>
        <label className="sc-dIvrsQ kwOJXh">
          <span>Search by operation name</span>
        </label>
        <Search
          aria-label="operations"
          id="search-operations"
          placeholder={placeholder || 'Search'}
          onChange={onChange}
        />
      </div>
    </>
  )
}
