import { useEffect, useState } from 'react'
import { DocumentAPI } from '@dmt/common'

type TResponse = { success: boolean; documentId?: string; error?: any }

const DEFAULT_DATASOURCE_ID = 'ForecastDS'
const baseUrl = '/dmss/api/v1'

export const insertDocument = (
  body: any,
  hasClickedCreate: any,
  dataSourceId: string = DEFAULT_DATASOURCE_ID
): any[] => {
  const [response, setResponse] = useState<TResponse>({ success: false })
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const documentAPI = new DocumentAPI()
  const url = `${baseUrl}/explorer/${dataSourceId}/add-document`

  useEffect(() => {
    setIsLoading(true)
    documentAPI
      .create(url, body)
      .then((result: string) => {
        console.log(result)
        setResponse({ success: true, documentId: result })
        setIsLoading(false)
      })
      .catch((err: any) => {
        console.error(err)
        setResponse({ success: false, error: err })
        setHasError(true)
        setIsLoading(false)
      })
  }, [hasClickedCreate, dataSourceId, body])

  return [response, isLoading, hasError]
}
