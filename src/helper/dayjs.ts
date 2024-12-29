import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('ko');

export function fromNow(time: string | Date) {
  return dayjs(time).fromNow();
}

export function FormatTime(time: string | Date, format = 'YYY.MM.DD h:mm A') {
  return dayjs(time).format(format);
}
