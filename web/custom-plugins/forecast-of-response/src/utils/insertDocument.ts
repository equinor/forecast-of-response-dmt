import { DocumentAPI } from '@dmt/common'

const DEFAULT_DATASOURCE_ID = 'ForecastDS'
const baseUrl = '/dmss/api/v1'

export const insertDocument = (
  body: any,
  isNew: boolean = true,
  dataSourceId: string = DEFAULT_DATASOURCE_ID
): PromiseLike<any> => {
  const documentAPI = new DocumentAPI()
  const url = `${baseUrl}/explorer/${dataSourceId}/add-document`

  // @ts-ignore-line
  return new Promise((resolve: any, reject: any) => {
    if (body) {
      documentAPI
        .create(url, body)
        .then((docId: string) => {
          resolve(docId)
        })
        .catch((err: any) => {
          reject(err)
        })
    } else {
      const err = 'No document body was provided.'
      reject(err)
    }
  })
}
