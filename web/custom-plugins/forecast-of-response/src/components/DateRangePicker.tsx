import React from 'react'
import { DatePicker, Space } from 'antd'
import { Label } from '@equinor/eds-core-react'
import styled from 'styled-components'

const { RangePicker } = DatePicker

const Div = styled.div``

export const DateRangePicker = (props: {
  setDateRange: Function
}): JSX.Element => {
  const { setDateRange } = props
  // onChange returns (date: Moment[], dateString: string[]) with start at [0] and end at [1]
  return (
    <>
      <Div>
        <Label label="Specify date" />
        <Space direction="vertical" size={12}>
          <RangePicker
            onChange={(dates: any[]) => {
              setDateRange([dates[0].toDate(), dates[1].toDate()])
            }}
          />
        </Space>
      </Div>
    </>
  )
}
