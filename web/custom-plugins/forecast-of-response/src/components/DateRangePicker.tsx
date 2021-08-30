import React from 'react'
import { DatePicker, Space } from 'antd'

const { RangePicker } = DatePicker

export const DateRangePicker = (props: any): JSX.Element => {
  return (
    <>
      <div>
        <label className="sc-dIvrsQ kwOJXh">
          <span>Specify date</span>
        </label>
        <Space direction="vertical" size={12}>
          <RangePicker />
        </Space>
      </div>
    </>
  )
}
