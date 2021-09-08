import { DocumentAPI } from '@dmt/common'

const DEFAULT_DATASOURCE_ID = 'ForecastDS'
const baseUrl = '/dmss/api/v1'

export const insertDocument = (
  body: any,
  isNew: boolean = true,
  dataSourceId: string = DEFAULT_DATASOURCE_ID
): Promise<string> => {
  const documentAPI = new DocumentAPI()
  const url = `${baseUrl}/explorer/${dataSourceId}/add-document`

  return documentAPI.create(url, body)
}
