import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isTomorrow from "dayjs/plugin/isTomorrow";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(isTomorrow);