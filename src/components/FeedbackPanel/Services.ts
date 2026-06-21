
import { uploadFileJson } from '../../firebase.ts'
import { type FeedbackSu } from '../../types/Form.ts'
import { PATH_FEEDBACK_STORAGE } from '../../types/Consts.ts'

export const saveFeedbackForm = async (feedback: FeedbackSu, id: string): Promise<string> => {
  const jsStr = JSON.stringify(feedback);
  const fileName = PATH_FEEDBACK_STORAGE + id + ".json"

  await uploadFileJson(jsStr, fileName)

  return id
}
