import React from "react";
import { UncontrolledTooltip } from "reactstrap";

const WEEKDAY = 7;
const WEEKS = 53;
const COLORS = ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"];

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const month_str = month < 10 ? "0" + month : month;
  const day_str = day < 10 ? "0" + day : day;
  return year + "-" + month_str + "-" + day_str;
};

interface Props {
  data: Date[];
  formatTooltip?: (date: string, count: number) => string;
}

class CalendarHeatmap extends React.Component<Props> {
  render() {
    const next_sunday = new Date();
    while (next_sunday.getDay() != 0) {
      next_sunday.setDate(next_sunday.getDate() + 1);
    }

    const current_date = new Date(next_sunday);
    current_date.setDate(current_date.getDate() - WEEKS * WEEKDAY);

    const count_map = new Map<string, number>();
    while (formatDate(current_date) !== formatDate(next_sunday)) {
      count_map.set(formatDate(current_date), 0);
      current_date.setDate(current_date.getDate() + 1);
    }

    this.props.data.forEach(date => {
      const s = formatDate(date);
      const count = count_map.get(s);
      if (count !== undefined) {
        count_map.set(s, count + 1);
      }
    });

    const table_data = Array.from(count_map)
      .map(([date, count]) => ({ count, date }))
      .sort((a, b) => {
        if (a.date < b.date) {
          return -1;
        } else {
          return 1;
        }
      });

    const tabled: { count: number; date: string }[][] = [];

    for (let day_of_week = 0; day_of_week < WEEKDAY; day_of_week++) {
      const week_row: { count: number; date: string }[] = [];
      for (let week = 0; week < WEEKS; week++) {
        week_row.push(table_data[WEEKDAY * week + day_of_week]);
      }
      tabled.push(week_row);
    }

    const block_width = 10;
    const width = block_width * WEEKS;
    const height = block_width * WEEKDAY;
    return (
      <div>
        <svg viewBox={`0 0 ${width} ${height}`}>
          {tabled.map((row, i) =>
            row.map((day, j) => {
              const { date, count } = day;
              const color = COLORS[Math.min(count, COLORS.length - 1)];
              return (
                <rect
                  key={date}
                  id={`rect-${date}`}
                  x={j * block_width}
                  y={i * block_width}
                  width={block_width}
                  height={block_width}
                  fill={color}
                />
              );
            })
          )}
        </svg>

        {tabled.map((row, i) =>
          row.map((day, j) => {
            const { date, count } = day;

            return (
              <UncontrolledTooltip
                delay={{ show: 0, hide: 0 }}
                key={date}
                placement="right"
                target={`rect-${date}`}
              >
                {this.props.formatTooltip
                  ? this.props.formatTooltip(date, count)
                  : `${date}: ${count}`}
              </UncontrolledTooltip>
            );
          })
        )}
      </div>
    );
  }
}

export default CalendarHeatmap;
