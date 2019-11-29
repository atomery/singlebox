export const getCurrentScheduledDateTime = (state) => {
  const {
    pauseNotificationsBySchedule,
    pauseNotificationsByScheduleFrom,
    pauseNotificationsByScheduleTo,
  } = state.preferences;

  if (!pauseNotificationsBySchedule) return null;

  const mockFromDate = new Date(pauseNotificationsByScheduleFrom);
  const mockToDate = new Date(pauseNotificationsByScheduleTo);
  const currentDate = new Date();
  // convert to minute for easy calculation
  const fromMinute = mockFromDate.getHours() * 60 + mockFromDate.getMinutes();
  const toMinute = mockToDate.getHours() * 60 + mockToDate.getMinutes();
  const currentMinute = currentDate.getHours() * 60 + currentDate.getMinutes();

  // pause notifications from 8 AM to 7 AM
  // means pausing from 8 AM to midnight (today), midnight to 7 AM (next day)
  // or means pausing from 8 AM to midnight (yesterday), midnight to 7 AM (today)
  if (fromMinute > toMinute) {
    if (currentMinute >= fromMinute && currentMinute <= 23 * 60 + 59) {
      const from = new Date();
      from.setHours(mockFromDate.getHours());
      from.setMinutes(mockFromDate.getMinutes()); // from 8 AM of the current day

      const to = new Date();
      to.setDate(to.getDate() + 1);
      to.setHours(mockToDate.getHours());
      to.setMinutes(mockToDate.getMinutes()); // til 7 AM of tommorow
      return { from, to };
    }
    if (currentMinute >= 0 && currentMinute <= toMinute) {
      const from = new Date();
      from.setDate(from.getDate() - 1);
      from.setHours(mockFromDate.getHours());
      from.setMinutes(mockFromDate.getMinutes()); // from 8 AM of yesterday

      const to = new Date();
      to.setHours(mockToDate.getHours());
      to.setMinutes(mockToDate.getMinutes()); // til 7 AM of today
      return { from, to };
    }
  }

  // pause notification from 7 AM to 8 AM
  // means pausing from 7 AM to 8 AM of today
  if (fromMinute <= toMinute) {
    if (currentMinute >= fromMinute && currentMinute <= toMinute) {
      const from = new Date();
      from.setDate(from.getDate());
      from.setHours(mockFromDate.getHours());
      from.setMinutes(mockFromDate.getMinutes()); // from 8 AM of today

      const to = new Date();
      to.setDate(to.getDate());
      to.setHours(mockToDate.getHours());
      to.setMinutes(mockToDate.getMinutes()); // til 8 AM of today
      return { from, to };
    }
  }

  return null;
};

// return reason why notifications are paused
export const getPauseNotificationsInfo = (state) => {
  const { pauseNotifications } = state.preferences;

  const schedule = getCurrentScheduledDateTime(state);

  const currentDate = new Date();

  if (typeof pauseNotifications === 'string') {
    // overwrite schedule
    if (pauseNotifications.startsWith('resume:')) {
      const overwriteTilDate = new Date(pauseNotifications.substring(7));
      if (overwriteTilDate >= currentDate) {
        return null;
      }
    }

    // normal pause (without scheduling)
    if (pauseNotifications.startsWith('pause:')) {
      const tilDate = new Date(pauseNotifications.substring(6));
      if (tilDate >= currentDate) {
        return {
          reason: 'non-scheduled',
          tilDate,
          schedule,
        };
      }
    }
  }

  // check schedule
  if (schedule && currentDate >= schedule.from && currentDate <= schedule.to) {
    return {
      reason: 'scheduled',
      tilDate: schedule.to,
      schedule,
    };
  }

  return null;
};

export const shouldPauseNotifications = (state) => getPauseNotificationsInfo(state) !== null;
