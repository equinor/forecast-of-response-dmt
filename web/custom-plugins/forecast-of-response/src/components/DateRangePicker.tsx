import React from 'react'
import { DatePicker, Space } from 'antd'
import { Label } from '@equinor/eds-core-react'
import styled from 'styled-components'

const { RangePicker } = DatePicker

const Div = styled.div``

export const DateRangePicker = (props: any): JSX.Element => {
  return (
    <>
      <Div>
        <Label label="Specify date" />
        <Space direction="vertical" size={12}>
          <RangePicker />
        </Space>
      </Div>
    </>
  )
}
