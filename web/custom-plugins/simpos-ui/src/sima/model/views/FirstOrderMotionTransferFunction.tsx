import React, {useEffect, useState} from 'react'
import {useDocument} from '@dmt/common'
import {DmtUIPlugin} from '@dmt/core-plugins'


import { SIMA_Model_FirstOrderMotionTransferFunction } from './FirstOrderMotionTransferFunction_src.js'

const FirstOrderMotionTransferFunction_Component = (props: DmtUIPlugin) => {
  const {
    dataSourceId,
    documentId,
    attribute,
    updateDocument,
} = props

const [
    document,
    isLoading,
    setDocument,
    hasError
] = useDocument(dataSourceId, documentId, attribute)

if (isLoading) {
    return <div>Loading document...</div>
}

if (hasError) {
    return <div>Error getting the document</div>
}

  return <SIMA_Model_FirstOrderMotionTransferFunction document={document} />
}

export { FirstOrderMotionTransferFunction_Component as SIMA_Model_FirstOrderMotionTransferFunction }

