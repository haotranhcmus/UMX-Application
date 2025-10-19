import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import AppText from "@/components/AppText";
import { theme } from "@/theme";
import { AntDesign } from "@expo/vector-icons";

interface WeeklyCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDay?: Date;
  setSelectedDay?: (date: Date) => void;
}

export default function WeeklyCalendar({
  onDateSelect,
  selectedDay = new Date(),
  setSelectedDay,
}: WeeklyCalendarProps) {
  const weekDays = useMemo(
    () => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    []
  );
  const today = useMemo(() => new Date(), []);

  const [weekOffset, setWeekOffset] = useState(0);

  // Tính toán ngày trong tuần dựa trên offset
  const dayData = useMemo(() => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + weekOffset * 7);

    return weekDays.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return { day, date };
    });
  }, [weekOffset, today, weekDays]);

  // Lấy tháng hiện tại từ ngày đầu tuần
  const currentMonth = useMemo(() => {
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    return `${monthNames[dayData[0].date.getMonth() < selectedDay.getMonth() ? selectedDay.getMonth() : dayData[0].date.getMonth()]} ${dayData[0].date.getFullYear()}`;
  }, [dayData, selectedDay]);

  // Chuyển tuần trước
  const goToPreviousWeek = useCallback(() => {
    setWeekOffset((prev) => prev - 1);
  }, []);

  // Chuyển tuần sau
  const goToNextWeek = useCallback(() => {
    setWeekOffset((prev) => prev + 1);
  }, []);

  // Về hôm nay
  const goToToday = useCallback(() => {
    setWeekOffset(0);
    setSelectedDay(new Date());
    onDateSelect?.(new Date());
  }, [onDateSelect]);

  // Chọn ngày
  const handleDayPress = useCallback(
    (date: Date) => {
      setSelectedDay(date || new Date());
      onDateSelect?.(date || new Date());
    },
    [onDateSelect]
  );

  // Kiểm tra ngày có phải hôm nay không
  const isToday = useCallback(
    (date: Date) => {
      return date.toDateString() === today.toDateString();
    },
    [today]
  );

  // Kiểm tra ngày có được chọn không
  const isSelected = useCallback(
    (date: Date) => {
      return date.toDateString() === selectedDay.toDateString();
    },
    [selectedDay]
  );

  return (
    <View style={styles.container}>
      {/* Header với navigation */}
      <View style={styles.header}>
        <Pressable
          onPress={goToPreviousWeek}
          style={styles.navButton}
          android_ripple={{ color: theme.colors.blueLight }}
        >
          <AntDesign name="left" size={20} color={theme.colors.primary} />
        </Pressable>

        <AppText style={styles.monthText} bold>
          {currentMonth}
        </AppText>

        <Pressable
          onPress={goToNextWeek}
          style={styles.navButton}
          android_ripple={{ color: theme.colors.blueLight }}
        >
          <AntDesign name="right" size={20} color={theme.colors.primary} />
        </Pressable>
      </View>

      {/* Danh sách ngày trong tuần */}
      <View style={styles.weekContainer}>
        {dayData.map((item, index) => {
          const selected = isSelected(item.date);
          const today = isToday(item.date);

          return (
            <View
              key={`${item.date.toISOString()}-${index}`}
              style={styles.dayWrapper}
            >
              <AppText style={styles.dayLabel} bold>
                {item.day}
              </AppText>
              <Pressable
                style={[
                  styles.dayButton,
                  selected && styles.dayButtonSelected,
                  today && !selected && styles.dayButtonToday,
                ]}
                onPress={() => handleDayPress(item.date)}
                android_ripple={{
                  color: theme.colors.blueLight,
                  borderless: true,
                }}
              >
                <AppText
                  bold
                  style={[
                    styles.dayNumber,
                    selected && styles.dayNumberSelected,
                    today && !selected && styles.dayNumberToday,
                  ]}
                >
                  {item.date.getDate()}
                </AppText>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.blueLight,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  monthText: {
    fontSize: 18,
    color: theme.colors.text,
    flex: 1,
    textAlign: "center",
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  dayWrapper: {
    alignItems: "center",
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  dayButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  dayButtonToday: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  dayNumber: {
    fontSize: 16,
    color: theme.colors.text,
  },
  dayNumberSelected: {
    color: theme.colors.white,
  },
  dayNumberToday: {
    color: theme.colors.primary,
  },
  todayButton: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.blueLight,
    borderRadius: 20,
    marginBottom: 16,
  },
  todayButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  selectedDateInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  selectedDateLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  selectedDateValue: {
    fontSize: 16,
    color: theme.colors.text,
  },
});
