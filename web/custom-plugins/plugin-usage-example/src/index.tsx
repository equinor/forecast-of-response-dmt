import * as React from 'react'

import {useDocument} from '@dmt/common'
import {DmtPluginType, DmtUIPlugin} from '@dmt/core-plugins'

import DisplayBlueprint from './DisplayBlueprint'
import EditDocument from './EditDocument'
import AddingWheelsComponent from "./AddingWheels";


const DisplayBlueprintComponent = (props: DmtUIPlugin) => {
    const {
        document,
        fetchBlueprint
    } = props

    return <DisplayBlueprint document={document} fetchBlueprint={fetchBlueprint}/>
}

const EditDocumentComponent = (props: DmtUIPlugin) => {
    const {
        dataSourceId,
        documentId,
        updateDocument,
    } = props

    const [
        document,
        isLoading,
        setDocument,
        hasError
    ] = useDocument(dataSourceId, documentId)

    if (isLoading) {
        return <div>Loading document...</div>
    }

    if (hasError) {
        return <div>Error getting the document</div>
    }

    return (
        <EditDocument
            document={document}
            updateDocument={updateDocument}
            setDocument={setDocument}
        />
    )
}



export const plugins: any = [
    {
        pluginName: 'edit-document',
        pluginType: DmtPluginType.UI,
        content: {
            component: EditDocumentComponent,
        },
    },
    {
        pluginName: 'display-blueprint',
        pluginType: DmtPluginType.UI,
        content: {
            component: DisplayBlueprintComponent,
        },
    },
    {
        pluginName: 'adding-wheels',
        pluginType: DmtPluginType.UI,
        content: {
            component: AddingWheelsComponent,
        },
    },
]
