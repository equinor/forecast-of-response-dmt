import { useEffect, useState } from 'react'
import { DocumentAPI } from '@dmt/common'

const DEFAULT_DATASOURCE_ID = 'ForecastDS'

export const useSearch = (
  type: string,
  dataSourceId: string = DEFAULT_DATASOURCE_ID
): any => {
  const [searchResult, setSearchResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const documentAPI = new DocumentAPI()

  useEffect(() => {
    setIsLoading(true)
    documentAPI
      .search(dataSourceId, {
        type: type,
      })
      .then((result: any) => {
        setIsLoading(false)
        // @ts-ignore-line
        setSearchResult(Object.values(result))
      })
      .catch((err: any) => {
        console.error(err)
        setIsLoading(false)
        setHasError(true)
      })
  }, [dataSourceId, type])

  return [searchResult, isLoading, setSearchResult, hasError]
}
