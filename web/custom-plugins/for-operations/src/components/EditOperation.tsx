import React, { useState } from 'react'
import { DmtUIPlugin } from '@dmt/core-plugins'
import { TLocation, TOperation } from '../Types'
import 'react-datepicker/dist/react-datepicker.css'
import { StepperState } from '../Enums'
import { DocumentAPI } from '@dmt/common'
import Stepper from './Stepper'
import { CenterWrapper, FlexWrapper } from './Wrappers'
import SelectLocation from './SelectLocation'
import SelectModel from './SelectModel'
import { Button } from '@equinor/eds-core-react'

const documentAPI = new DocumentAPI()

// export interface DmtUIPlugin {
//   type: string
//   dataSourceId: string
//   documentId: string
//   explorer: any
//   uiRecipe: any
//   useIndex: any
//   onSubmit: any
//   document: any
//   updateDocument: any
// }

const StepperHeader = ({ creationStep, setCreationStep }: any): JSX.Element => (
  <FlexWrapper>
    <Stepper
      state={StepperState.ACTIVE}
      title={'Location'}
      description={'Select or create location for operation'}
      number={1}
      currentStep={creationStep}
      onSelect={setCreationStep}
    />
    <Stepper
      state={StepperState.ACTIVE}
      title={'Model'}
      description={'Select or upload a SIMA model'}
      number={2}
      currentStep={creationStep}
      onSelect={setCreationStep}
    />
    <Stepper
      state={StepperState.ACTIVE}
      title={'Method'}
      description={'Method for operation'}
      number={3}
      currentStep={creationStep}
      onSelect={setCreationStep}
    />
    <Stepper
      state={StepperState.ACTIVE}
      title={'Operation type'}
      description={'A description...'}
      number={4}
      currentStep={creationStep}
      onSelect={setCreationStep}
    />
    <Stepper
      state={StepperState.ACTIVE}
      title={'Criteria'}
      description={'A description...'}
      number={5}
      currentStep={creationStep}
      onSelect={setCreationStep}
    />
    <Stepper
      state={StepperState.ACTIVE}
      title={'Test run'}
      description={'A description...'}
      number={6}
      currentStep={creationStep}
      onSelect={setCreationStep}
    />
  </FlexWrapper>
)

export default (props: DmtUIPlugin): JSX.Element => {
  const [creationStep, setCreationStep] = useState<number>(1)
  const [operation, setOperation] = useState<TOperation>(props.document)

  const renderSwitch = () => {
    switch (creationStep) {
      case 1:
        return (
          <SelectLocation
            nextStep={() => setCreationStep(creationStep + 1)}
            onChange={(location: TLocation) =>
              setOperation({ ...operation, location: location })
            }
          />
        )
      case 2:
        return (
          <SelectModel nextStep={() => setCreationStep(creationStep + 1)} />
        )
      default:
        return <div>Invalid step state</div>
    }
  }

  return (
    <>
      <StepperHeader
        creationStep={creationStep}
        setCreationStep={setCreationStep}
      />
      <pre>{JSON.stringify(operation, null, 2)}</pre>
      {renderSwitch()}
      <CenterWrapper>
        <Button onClick={() => props.updateDocument(operation)}>Save</Button>
      </CenterWrapper>
    </>
  )
}
