import { useEffect, useState } from 'react'
import { DocumentAPI } from '@dmt/common'

const DEFAULT_DATASOURCE_ID = 'ForecastDS'

export const useSearch = (
  type: string,
  dataSourceId: string = DEFAULT_DATASOURCE_ID
): any => {
  const [searchResult, setSearchResult] = useState(null)
  const [hasError, setHasError] = useState(false)
  const documentAPI = new DocumentAPI()

  useEffect(() => {
    documentAPI
      .search(dataSourceId, {
        type: type,
      })
      .then((result: any) => {
        // @ts-ignore-line
        setSearchResult(Object.values(result))
      })
      .catch((err: any) => {
        console.error(err)
        setHasError(true)
      })
  }, [dataSourceId, type])

  return { result: searchResult, hasError: hasError }
}
