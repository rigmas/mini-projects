import Shift from "../../database/default/entity/shift";
import { isWithinInterval, isEqual } from "date-fns";
import { HttpError } from "../classes/HttpError";

export const isIntervalClashed = (startTimeDate: Date, endTimeDate: Date, shifts: Shift[]): Error | void => {
  shifts.map((el) => {
    const sameTime = 
      isEqual(startTimeDate, new Date(el.date + ' ' + el.startTime)) 
      && 
      isEqual(endTimeDate, new Date(el.date + ' ' + el.endTime));
    
    if (
      (!sameTime &&isWithinInterval(new Date(el.date + ' ' + el.startTime), { start: startTimeDate, end: endTimeDate }))
      ||
      (!sameTime && isWithinInterval(new Date(el.date + ' ' + el.endTime), { start: startTimeDate, end: endTimeDate }))
    ) throw new HttpError(400, "Shift is clashed");
  })
}