import { DmssAPI } from '@dmt/common'

const DEFAULT_DATASOURCE_ID = 'ForecastDS'
const DEFAULT_DIRECTORY = 'ForecastOfResponse'

export const insertDocument = (
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
      .then((addToPathResponse: string) => {
        const jsonRes = JSON.parse(addToPathResponse)
        resolve(jsonRes.uid)
      })
      .catch((err: any) => {
        reject(err)
      })
  })
}
