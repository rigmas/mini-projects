import { IGetPublish } from "."
import Publish from "../../database/default/entity/publish"
import Shift from "../../database/default/entity/shift"

export interface IGetPublishShift {
  publish: Publish;
  Shift: Shift;
}
