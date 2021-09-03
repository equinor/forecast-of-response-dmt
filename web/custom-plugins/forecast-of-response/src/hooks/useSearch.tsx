import { useEffect, useState, useContext } from 'react'
import { DmssAPI, AuthContext } from '@dmt/common'

const DEFAULT_DATASOURCE_ID = 'ForecastDS'

export const useSearch = (
  type: string,
  dataSourceId: string = DEFAULT_DATASOURCE_ID
): any => {
  const [searchResult, setSearchResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { token } = useContext(AuthContext)
  const dmssAPI = new DmssAPI(token)

  useEffect(() => {
    setIsLoading(true)
    dmssAPI
      .searchDocuments(dataSourceId, {
        type: type,
      })
      .then((result: any) => {
        // @ts-ignore-line
        setSearchResult(Object.values(result))
        setIsLoading(false)
      })
      .catch((err: any) => {
        console.error(err)
        setHasError(true)
        setIsLoading(false)
      })
  }, [dataSourceId, type])

  return [searchResult, isLoading, setSearchResult, hasError]
}
