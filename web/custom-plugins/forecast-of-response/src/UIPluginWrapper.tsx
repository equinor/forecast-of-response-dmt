import { TSimulationConfig } from './Types'
import React, { useContext, useEffect, useState } from 'react'
import { useBlueprint, UiPluginContext } from '@dmt/common'
import { Button } from '@equinor/eds-core-react'
import styled from 'styled-components'

const StyledButton = styled(Button)`
  margin: 0 20px;
  text-decoration-line: ${(props: any) =>
    (props.active == true && 'underline') || 'none'};
`

function UIPluginWrapper(props: {
  simulationConfig: TSimulationConfig
  dottedId: string
  entity: any
}) {
  const { simulationConfig, dottedId, entity } = props
  const [dataSourceId, documentId] = dottedId.split('.', 1)
  const [blueprint, loadingBlueprint, error] = useBlueprint(entity.type)
  const { loading, getUiPlugin } = useContext(UiPluginContext)
  const [selectedPlugin, setSelectedPlugin] = useState<number>(0)
  const [selectablePluginsComponent, setSelectablePluginsComponent] = useState<
    [string, Function][]
  >([])

  useEffect(() => {
    if (!blueprint) return
    if (!blueprint?.uiRecipes?.length) {
      setSelectablePluginsComponent(['yaml', getUiPlugin('yaml')])
    } else {
      setSelectablePluginsComponent(
        blueprint.uiRecipes.map((uiRecipe: any) => [
          uiRecipe?.plugin,
          getUiPlugin(uiRecipe?.plugin),
        ])
      )
    }
  }, [blueprint, loadingBlueprint])

  if (loadingBlueprint || loading) return <div>Loading...</div>

  if (error)
    return (
      <div style={{ color: 'red' }}>
        Failed to fetch Blueprint {entity.type}
      </div>
    )

  const UiPlugin = selectablePluginsComponent[selectedPlugin][1]

  return (
    <>
      <div style={{ margin: '10px' }}>
        {selectablePluginsComponent.map((component, index) => (
          <StyledButton
            key={index}
            onClick={() => setSelectedPlugin(index)}
            active={index === selectedPlugin}
          >
            {component[0]}
          </StyledButton>
        ))}
      </div>
      <UiPlugin
        dataSourceId={dataSourceId}
        documentId={documentId}
        document={entity}
        result={entity}
        simulationConfig={simulationConfig}
        dottedId={dottedId}
      />
    </>
  )
}
export { UIPluginWrapper }
