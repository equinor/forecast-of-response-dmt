import React, {useEffect, useState} from 'react'
import {useDocument} from '@dmt/common'
import {DmtPluginType, DmtUIPlugin} from '@dmt/core-plugins'
import {Blueprint} from "./domain/Blueprint";

const addWheels = async (createDocument, fetchBlueprint, document) => {
    const blueprintJSON = await fetchBlueprint(document.type)
    const blueprint = new Blueprint(blueprintJSON)
    const attribute = blueprint.getBlueprintAttribute('wheels')
    const wheel1 = await createDocument(attribute.getAttributeType())
    document.wheels.push(wheel1)
    return document
}

const AddingWheelsComponent = (props: DmtUIPlugin) => {
    const {
        dataSourceId,
        documentId,
        updateDocument,
        createDocument,
        fetchBlueprint
    } = props

    const [
        document,
        isLoading,
        setDocument,
        hasError
    ] = useDocument(dataSourceId, documentId)

    const [isUpdatingDocument, setIsUpdatingDocument] = useState(false)


    if (isLoading) {
        return <div>Loading document...</div>
    }

    if (hasError) {
        return <div>Error getting the document</div>
    }

    const handleAddWheels = () => {
        setIsUpdatingDocument(true)
        addWheels(createDocument, fetchBlueprint, document).then((result) => {
            setDocument(result)
            setIsUpdatingDocument(false)
        })
    }

    if (isUpdatingDocument) {
        return <>Adding the wheels to the document...</>
    }

    const handleUpdateGlobal = () => {
        updateDocument(document)
    }

    return (
        <>
            <div>Number of wheels {document.wheels.length}</div>
            <button onClick={() => handleUpdateGlobal()}>Save car</button>
            <button onClick={() => handleAddWheels()}>Add wheels (only local state)</button>
        </>
    )
}

export default AddingWheelsComponent