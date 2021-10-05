import { DmssAPI } from '@dmt/common'
import { DEFAULT_DATASOURCE_ID, DEFAULT_DIRECTORY } from '../const'

export const addToPath = (
  body: any,
  token: string,
  dataSourceId: string = DEFAULT_DATASOURCE_ID,
  directory: string = DEFAULT_DIRECTORY
): Promise<string> => {
  const dmssAPI = new DmssAPI(token)

  return new Promise((resolve, reject) => {
    dmssAPI.generatedDmssApi
      .explorerAddToPath({
        dataSourceId: dataSourceId,
        document: JSON.stringify(body),
        directory: directory,
      })
      .then((response: string) => {
        const data = JSON.parse(response)
        resolve(data.uid)
      })
      .catch((err: any) => {
        reject(err)
      })
  })
}
