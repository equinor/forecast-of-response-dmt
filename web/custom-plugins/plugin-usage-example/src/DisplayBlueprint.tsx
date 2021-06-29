import React, {useEffect, useState} from 'react'

type DisplayBlueprintDataProps = {
    document: any
    fetchBlueprint: any
}

const getDocumentAttribute = (blueprint: any, attributeName: string) => {
    if (blueprint[attributeName]) {
        return blueprint[attributeName]
    } else {
        throw new Error(
            `Tried to access an attribute that does not exist on document`
        )
    }
}

export default (props: DisplayBlueprintDataProps) => {
    const {document, fetchBlueprint} = props

    // Since fetchBlueprint is returning a promise,
    // we need to wait for it,
    // and after resolving,
    // we set the result in a state,
    // so that the react component will re-render
    // when promise is resolved.
    const [blueprint, setBlueprint] = useState();
    useEffect(() => {
        fetchBlueprint(document.type).then(result => {
            setBlueprint(result)
        })
    }, [])

    if(!blueprint) {
        return <>Loading...</>
    }

    return (
        <div>
            <div>Some information extracted from the blueprint:</div>
            <div>Blueprint attributes names:</div>
            {getDocumentAttribute(blueprint, 'attributes').map((attribute: any) => {
                return <div key={attribute.name}>- {attribute.name}</div>
            })}
            <div style={{marginTop: '25px'}}>Blueprint id: {document._id} </div>
            <div style={{marginTop: '25px'}}>
                Does the blueprint have any storage recipes?{' '}
                {getDocumentAttribute(blueprint, 'storageRecipes').length > 0 ? 'Yes' : 'No'}
            </div>
        </div>
    )
}
