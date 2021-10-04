import React from 'react'
import { DatePicker, Space } from 'antd'
import { Label } from '@equinor/eds-core-react'

const { RangePicker } = DatePicker

const DateRangePicker = (props: {
  setDateRange: Function
}): JSX.Element => {
  const { setDateRange } = props
  // onChange returns (date: Moment[], dateString: string[]) with start at [0] and end at [1]
  return (
    <>
      <div>
        <Label label="Specify date" />
        <Space direction="vertical" size={12}>
          <RangePicker
            onChange={(dates: any[]) => {
              setDateRange([dates[0].toDate(), dates[1].toDate()])
            }}
          />
        </Space>
      </div>
    </>
  )
}

export default DateRangePicker
