import { StepperState } from '../Enums'
import React from 'react'
import styled from 'styled-components'

interface IStepper {
  state: StepperState
  title: string
  description: string
  number: number
  currentStep: number
  onSelect: any
}

const NumberWrapper = styled.div<{ active: boolean }>`
  display: flex;
  height: min-content;
  border: ${(props: any) => (props.active ? '#007079' : 'gray')} solid 3px;
  border-radius: 50px;
  width: 30px;
  justify-content: center;
`

const PointerBox = styled.div`
  &:hover {
    cursor: pointer;
  }
`

const HorizontalLine = styled.div<{ active: boolean }>`
  border-top: 3px solid ${(props: any) => (props.active ? '#007079' : 'gray')};
  width: 150px;
  height: 3px;
  margin: 4px 10px;
`

const NumberBox = ({ number, active }: any) => (
  <NumberWrapper active={active}>
    <b style={{ margin: '3px' }}>{number}</b>
  </NumberWrapper>
)

export default ({
  state,
  currentStep,
  title,
  description,
  number,
  onSelect,
}: IStepper) => {
  return (
    <PointerBox style={{ display: 'flex' }} onClick={() => onSelect(number)}>
      <NumberBox number={number} active={number === currentStep} />
      <div style={{ display: 'flex', flexFlow: 'column', margin: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <b>{title}</b>
          <HorizontalLine active={number === currentStep} />
        </div>
        <div>{description}</div>
      </div>
    </PointerBox>
  )
}
