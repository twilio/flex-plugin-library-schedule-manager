import { Manager, Notifications } from '@twilio/flex-ui';
import { NotificationIds } from '../../flex-hooks/notifications/ScheduleManager';
import ScheduleManagerService from '../serverless/ScheduleManager/ScheduleManagerService';
import { Rule, Schedule, ScheduleManagerConfig } from '../../types/schedule-manager';
import { ErrorManager, FlexPluginErrorType } from '../../ErrorManager';
import { RRule } from 'rrule';
import { DateTime } from 'luxon';

let config = {
  data: {
    rules: [],
    schedules: [],
  },
  version: '',
} as ScheduleManagerConfig;

const delay = async (ms: number): Promise<void> => {
  return await new Promise((resolve) => setTimeout(resolve, ms));
};

export const canShowScheduleManager = (manager: Manager) => {
  const { roles } = manager.user;
  return roles.indexOf('admin') >= 0;
};

export const loadScheduleData = async (): Promise<ScheduleManagerConfig | null> => {
  const listSchedulesResponse = await ScheduleManagerService.list();

  if (listSchedulesResponse) {
    config = listSchedulesResponse;
  }

  return listSchedulesResponse;
};

export const referencedSchedules = (schedules: Schedule[], rule: Rule): string[] => {
  const refSchedules = [] as string[];
  if (schedules) {
    schedules.forEach((schedule) => {
      if (rule && schedule.rules.indexOf(rule.id) >= 0) {
        refSchedules.push(schedule.name);
      }
    });
  }

  return refSchedules;
};
export const updateScheduleData = (newSchedule: Schedule | null, existingSchedule: Schedule | null): Schedule[] => {
  if (existingSchedule === null && newSchedule !== null) {
    // adding schedule
    console.log('config.data.schedules', config.data.schedules);
    config.data.schedules = [...config.data.schedules, newSchedule];
  } else if (existingSchedule !== null && newSchedule === null) {
    // removing existing schedule
    const existingIndex = config.data.schedules.indexOf(existingSchedule);

    if (existingIndex >= 0) {
      config.data.schedules[existingIndex].isDeleted = true;
      // config.data.schedules.splice(existingIndex, 1);
    }
  } else if (existingSchedule !== null && newSchedule !== null) {
    // updating existing schedule
    const existingIndex = config.data.schedules.indexOf(existingSchedule);

    if (existingIndex >= 0) {
      config.data.schedules.splice(existingIndex, 1, newSchedule);
    }
  }

  return config.data.schedules;
};

export const updateRuleData = (newRule: Rule | null, existingRule: Rule | null): Rule[] => {
  if (existingRule === null && newRule !== null) {
    // adding rule
    config.data.rules = [...config.data.rules, newRule];
  } else if (existingRule !== null && newRule === null) {
    // removing existing rule
    const existingIndex = config.data.rules.indexOf(existingRule);

    if (existingIndex >= 0) {
      config.data.rules[existingIndex].isDeleted = true;
      // config.data.rules.splice(existingIndex, 1);
    }
  } else if (existingRule !== null && newRule !== null) {
    // updating existing rule
    const existingIndex = config.data.rules.indexOf(existingRule);

    if (existingIndex >= 0) {
      config.data.rules.splice(existingIndex, 1, newRule);
    }
  }

  return config.data.rules;
};

export const isScheduleUnique = (newSchedule: Schedule, existingSchedule: Schedule | null): boolean => {
  if (existingSchedule !== null) {
    const otherSchedules = config.data.schedules.filter((item) => existingSchedule.name !== item.name);
    const matchingSchedules = otherSchedules.filter((item) => newSchedule.name === item.name);
    return matchingSchedules.length == 0;
  } else {
    const matchingSchedules = config.data.schedules.filter((item) => newSchedule.name === item.name);
    return matchingSchedules.length == 0;
  }
};

export const isRuleUnique = (newRule: Rule, existingRule: Rule | null): boolean => {
  if (existingRule !== null) {
    const otherRules = config.data.rules.filter((item) => existingRule.id !== item.id);
    const matchingRules = otherRules.filter((item) => newRule.name === item.name);
    return matchingRules.length == 0;
  } else {
    const matchingRules = config.data.rules.filter((item) => newRule.name === item.name);
    return matchingRules.length == 0;
  }
};

export const publishSchedules = async (): Promise<number> => {
  // return values: 0=success, 2=version error, 3=failure, 4=in available activity
  if (Manager.getInstance().store.getState().flex.worker.activity.available === true) {
    Notifications.showNotification(NotificationIds.PUBLISH_FAILED_ACTIVITY);
    return 4;
  }

  const latestData: ScheduleManagerConfig = {
    data: {
      rules: config.data.rules.filter((rule) => rule.isDeleted !== true),
      schedules: config.data.schedules.filter((schedule) => schedule.isDeleted !== true),
    },
    version: config.version,
    versionIsDeployed: config.versionIsDeployed,
  };
  latestData.data.rules.map((rule) => {
    rule.isPublished && delete rule.isPublished;
    rule.isDeleted && delete rule.isDeleted;
  });
  latestData.data.schedules.map((schedule) => {
    schedule.isPublished && delete schedule.isPublished;
    schedule.isDeleted && delete schedule.isDeleted;
  });

  const updateResponse = await ScheduleManagerService.update(latestData);

  if (!updateResponse.success) {
    console.log('Schedule update failed', updateResponse);
    ErrorManager.createAndProcessError('Schedule update failed', {
      type: FlexPluginErrorType.action,
      context: 'Plugin.ScheduleManager.publishSchedules',
    });

    if (updateResponse.buildSid == 'versionError') {
      Notifications.showNotification(NotificationIds.PUBLISH_FAILED_OTHER_UPDATE);
      return 2;
    }

    Notifications.showNotification(NotificationIds.PUBLISH_FAILED);
    return 3;
  }

  // the build will take several seconds. use delay and check in a loop.
  await delay(2000);
  let updateStatus = await ScheduleManagerService.updateStatus(updateResponse.buildSid);

  while (updateStatus.buildStatus !== 'completed') {
    if (updateStatus.buildStatus === 'failed' || updateStatus.buildStatus === 'error') {
      // oh no
      console.log('Schedule update build failed', updateStatus);
      ErrorManager.createAndProcessError('Schedule update build failed', {
        type: FlexPluginErrorType.action,
        context: 'Plugin.ScheduleManager.publishSchedules',
      });
      Notifications.showNotification(NotificationIds.PUBLISH_FAILED);
      return 3;
    }

    await delay(2000);
    updateStatus = await ScheduleManagerService.updateStatus(updateResponse.buildSid);
  }

  const publishResponse = await ScheduleManagerService.publish(updateResponse.buildSid);

  if (!publishResponse.success) {
    console.log('Schedule publish failed', publishResponse);
    ErrorManager.createAndProcessError('Schedule publish failed', {
      type: FlexPluginErrorType.action,
      context: 'Plugin.ScheduleManager.publishSchedules',
    });
    Notifications.showNotification(NotificationIds.PUBLISH_FAILED);
    return 3;
  }

  Notifications.showNotification(NotificationIds.PUBLISH_SUCCESS);
  return 0;
};

const checkDate = (rule: Rule, now: Date) => {
  // first, check the date component of the rule.

  // if bounds are provided, check current date against them
  if (rule.startDate) {
    const startDate = new Date(Date.parse(rule.startDate));

    if (now.valueOf() < startDate.valueOf()) {
      // before start date; this rule is not a match
      console.log(`Rule ${rule.name} doesn't match: before start date`, startDate);
      return false;
    }
  }

  if (rule.endDate) {
    const endDate = new Date(Date.parse(rule.endDate));

    if (now.valueOf() > endDate.valueOf()) {
      // after end date; this rule is not a match
      console.log(`Rule ${rule.name} doesn't match: after end date`, endDate);
      return false;
    }
  }

  if (rule.dateRRule) {
    // extract rule from settings
    const ruleOptions = RRule.parseString(rule.dateRRule);

    // since the rule concerns only dates, and we are only comparing to today, we only need one occurrence
    // by default, past occurrences are not returned
    ruleOptions.count = 1;
    ruleOptions.dtstart = now;

    const rrule = new RRule(ruleOptions);
    let matchFound = false;

    rrule.all().forEach((occurrence) => {
      if (now.valueOf() == occurrence.valueOf()) {
        console.log(`Rule ${rule.name} occurrence matched`, occurrence);
        matchFound = true;
      }
    });

    if (!matchFound) {
      console.log(`Rule ${rule.name} doesn't match: no recurrence match`, ruleOptions);
      return false;
    }
  }

  return true;
};

const checkTime = (rule: Rule, nowTz: DateTime) => {
  if (rule.startTime) {
    const startTime = DateTime.fromISO(rule.startTime);

    if (nowTz.hour < startTime.hour) {
      console.log(`Rule ${rule.name} doesn't match: before start hour`, startTime.hour);
      return false;
    }

    if (nowTz.hour == startTime.hour && nowTz.minute < startTime.minute) {
      console.log(`Rule ${rule.name} doesn't match: before start minute`, startTime.minute);
      return false;
    }
  }

  if (rule.endTime) {
    const endTime = DateTime.fromISO(rule.endTime);

    if (nowTz.hour > endTime.hour) {
      console.log(`Rule ${rule.name} doesn't match: after end hour`, endTime.hour);
      return false;
    }

    if (nowTz.hour == endTime.hour && nowTz.minute >= endTime.minute) {
      console.log(`Rule ${rule.name} doesn't match: after end minute`, endTime.minute);
      return false;
    }
  }

  return true;
};

export const evaluateSchedule = (scheduleData: Schedule, rulesData: Rule[]) => {
  const matchingRules: Rule[] = [];
  const returnData = {
    isOpen: false,
    closedReason: 'closed',
  };

  // if the schedule is manually closed, we can return immediately
  if (scheduleData.manualClose) {
    returnData.isOpen = false;
    returnData.closedReason = 'manual';
    return returnData;
  }

  // get the current date/time in the schedule's timezone
  const nowTz: DateTime = DateTime.utc().setZone(scheduleData.timeZone);

  const now = new Date(Date.UTC(nowTz.year, nowTz.month - 1, nowTz.day));

  // evaluate each schedule rule to see if it is currently matching
  scheduleData.rules.forEach((ruleId: string) => {
    const rule = rulesData.find((rule: Rule) => rule.id == ruleId);
    if (rule && checkDate(rule, now) && checkTime(rule, nowTz)) {
      matchingRules.push(rule);
    }
  });

  const closedMatches = matchingRules.filter((rule) => !rule.isOpen);

  // if any non-open schedule(s) match, we are closed
  if (closedMatches.length > 0) {
    returnData.isOpen = false;
    returnData.closedReason = closedMatches[0].closedReason;
  } else {
    const openMatches = matchingRules.filter((rule) => rule.isOpen);

    // if only open schedule(s) match, we are open
    if (openMatches.length > 0) {
      returnData.isOpen = true;
      returnData.closedReason = '';
    }
  }

  // if nothing matches, the default returnData is used

  return returnData;
  // }
};
