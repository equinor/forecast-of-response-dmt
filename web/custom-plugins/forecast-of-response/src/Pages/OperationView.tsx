import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDocument, AuthContext } from '@dmt/common'
import { Tabs } from '@equinor/eds-core-react'
import { TOperation, TPhase } from '../Types'
import OperationDetails from '../components/Operations/OperationDetails'
import PhaseView from '../components/Operations/PhaseView'
import { hasExpertRole } from '../utils/auth'
import OperatorPhaseView from '../components/Operations/OperatorPhaseView'

export default (): JSX.Element => {
  const { data_source, entity_id } = useParams()
  const [document, isLoading, updateDocument, error] = useDocument(
    data_source,
    entity_id
  )
  const [activeTab, setActiveTab] = useState<number>(0)
  const [phases, setPhases] = useState<TPhase[]>([])
  const { userData } = useContext(AuthContext)
  const operation: TOperation = document

  useEffect(() => {
    if (!document) return
    setPhases(document.phases || [])
  }, [document])

  if (!document) return <>Loading...</>
  if (error) return <>Something went wrong. Sorry...</>

  return (
    <>
      <Tabs
        activeTab={activeTab}
        onChange={(index: number) => setActiveTab(index)}
        variant="fullWidth"
      >
        <Tabs.List>
          <Tabs.Tab>Information</Tabs.Tab>
          {phases.length ? (
            phases.map((phase: TPhase) => (
              <Tabs.Tab key={phase.name}>{phase.name}</Tabs.Tab>
            ))
          ) : (
            <div />
          )}
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel>
            <OperationDetails operation={operation} />
          </Tabs.Panel>
          {phases.length ? (
            phases.map((phase: TPhase, index: number) => (
              <Tabs.Panel key={phase.name}>
                {hasExpertRole(userData) ? (
                  <PhaseView
                    phase={phase}
                    dottedId={`${operation._id}.phases.${index}`}
                    stask={operation.stask}
                  />
                ) : (
                  <OperatorPhaseView phase={phase} />
                )}
              </Tabs.Panel>
            ))
          ) : (
            <div />
          )}
        </Tabs.Panels>
      </Tabs>
    </>
  )
}
