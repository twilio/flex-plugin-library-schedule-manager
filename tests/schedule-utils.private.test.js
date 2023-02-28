import helpers from './test-utils/test-helper';
const { DateTime } = require('luxon');

describe('Schedule Utils', () => {
  describe('evaluateSchedule', () => {
    beforeAll(() => {
      helpers.setup();
      global.Runtime._addAsset('/config.json', '../assets/config.private.json');
    });

    const scheduleData = {
      schedules: [
        {
          name: 'schedule-1',
          manualClose: false,
          timeZone: 'America/New_York',
          rules: [1, 2, 3],
        },
        {
          name: 'schedule-2',
          manualClose: true,
          timeZone: 'America/New_York',
          rules: [],
        },
        {
          name: 'manual-close',
          manualClose: true,
          timeZone: 'America/New_York',
          rules: [],
        },
      ],
      rules: [
        {
          id: 1,
          name: 'rule-1',
          startDate: '2023-02-12',
          endDate: '2023-02-13',
          startTime: '08:00:00',
          endTime: '12:00:00',
          isOpen: true,
          closedReason: '',
        },
        {
          id: 2,
          name: 'rule-2',
          startDate: '2023-02-13',
          endDate: '2023-02-14',
          startTime: '12:00:00',
          endTime: '16:00:00',
          isOpen: false,
          closedReason: 'out of hours',
        },
        {
          id: 3,
          name: 'rule-3',
          startDate: '2023-02-14',
          endDate: '2023-02-15',
          startTime: '16:00:00',
          endTime: '20:00:00',
          isOpen: true,
          closedReason: '',
        },
      ],
    };

    it('returns error if schedule not found', () => {
      const ScheduleUtils = require('../functions/common/helpers/schedule-utils.private');

      const spyMethod = jest.spyOn(ScheduleUtils, 'evaluateSchedule');
      const result = ScheduleUtils.evaluateSchedule('schedule-blah', null, scheduleData);

      expect(result).toEqual({
        error: 'Schedule schedule-blah not found',
        status: 404,
      });
      expect(spyMethod).toHaveBeenCalledTimes(1);
    });

    it('reads default schedule if schedule not found', () => {
      const ScheduleUtils = require('../functions/common/helpers/schedule-utils.private');

      const spyMethod = jest.spyOn(ScheduleUtils, 'evaluateSchedule');
      const result = ScheduleUtils.evaluateSchedule('ExampleTwo', null);

      expect(result).toEqual({
        isOpen: false,
        closedReason: 'manual',
      });
      expect(spyMethod).toHaveBeenCalledTimes(1);
    });

    it('returns manual close if schedule is manually closed', () => {
      const ScheduleUtils = require('../functions/common/helpers/schedule-utils.private');

      const spyMethod = jest.spyOn(ScheduleUtils, 'evaluateSchedule');
      const result = ScheduleUtils.evaluateSchedule('manual-close', null, scheduleData);

      expect(result).toEqual({
        isOpen: false,
        closedReason: 'manual',
      });
      expect(spyMethod).toHaveBeenCalledTimes(1);
    });

    it('returns open if open schedule rules match', () => {
      const ScheduleUtils = require('../functions/common/helpers/schedule-utils.private');

      const spyMethod = jest.spyOn(ScheduleUtils, 'evaluateSchedule');
      const result = ScheduleUtils.evaluateSchedule('schedule-1', '2023-02-13T10:00:00', scheduleData);

      expect(result).toEqual({
        isOpen: true,
        closedReason: '',
      });
      expect(spyMethod).toHaveBeenCalledTimes(1);
    });

    it('returns closed if closed schedule rules match', () => {
      const ScheduleUtils = require('../functions/common/helpers/schedule-utils.private');

      const spyMethod = jest.spyOn(ScheduleUtils, 'evaluateSchedule');
      const result = ScheduleUtils.evaluateSchedule('schedule-1', '2023-02-13T14:00:00', scheduleData);

      expect(result).toEqual({
        isOpen: false,
        closedReason: 'out of hours',
      });
      expect(spyMethod).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkTime', () => {
    beforeAll(() => {
      helpers.setup();
      global.Runtime._addAsset('/config.json', '../assets/config.private.json');
    });
    const nowTz = DateTime.fromISO('2023-02-13T10:00:00-05:00');

    it('returns true if there are no startTime or endTime in the rule', () => {
      const { checkTime } = require('../functions/common/helpers/schedule-utils.private');
      const rule = { name: 'rule1' };
      expect(checkTime(rule, nowTz)).toBe(true);
    });

    it('returns false if current time is before the startTime in the rule', () => {
      const { checkTime } = require('../functions/common/helpers/schedule-utils.private');
      const rule = { name: 'rule2', startTime: '2023-02-13T11:00:00-05:00' };
      expect(checkTime(rule, nowTz)).toBe(false);
    });

    it('returns false if current time is after the endTime in the rule', () => {
      const { checkTime } = require('../functions/common/helpers/schedule-utils.private');
      const rule = { name: 'rule3', endTime: '2023-02-13T09:00:00-05:00' };
      expect(checkTime(rule, nowTz)).toBe(false);
    });

    it('returns true if current time is within the startTime and endTime in the rule', () => {
      const { checkTime } = require('../functions/common/helpers/schedule-utils.private');
      const rule = { name: 'rule4', startTime: '2023-02-13T09:00:00-05:00', endTime: '2023-02-13T11:00:00-05:00' };
      expect(checkTime(rule, nowTz)).toBe(true);
    });
  });

  describe('checkDate', () => {
    beforeAll(() => {
      helpers.setup();
      global.Runtime._addAsset('/config.json', '../assets/config.private.json');
    });
    it('returns true if rule does not have startDate or endDate or dateRRule', () => {
      const { checkDate } = require('../functions/common/helpers/schedule-utils.private');
      const rule = { name: 'rule1' };
      const now = new Date();
      const result = checkDate(rule, now);
      expect(result).toBe(true);
    });

    it('returns false if now is before startDate', () => {
      const { checkDate } = require('../functions/common/helpers/schedule-utils.private');
      const rule = { name: 'rule2', startDate: '2023-03-01' };
      const now = new Date('2023-02-01');
      const result = checkDate(rule, now);
      expect(result).toBe(false);
    });

    it('returns false if now is after endDate', () => {
      const { checkDate } = require('../functions/common/helpers/schedule-utils.private');
      const rule = { name: 'rule3', endDate: '2023-01-01' };
      const now = new Date('2023-02-01');
      const result = checkDate(rule, now);
      expect(result).toBe(false);
    });

    it('returns true if now is between startDate and endDate', () => {
      const { checkDate } = require('../functions/common/helpers/schedule-utils.private');
      const rule = { name: 'rule4', startDate: '2023-01-01', endDate: '2023-03-01' };
      const now = new Date('2023-02-01');
      const result = checkDate(rule, now);
      expect(result).toBe(true);
    });

    it('returns true if recurrence match is found', () => {
      const { checkDate } = require('../functions/common/helpers/schedule-utils.private');
      const rule = { name: 'rule6', dateRRule: 'FREQ=DAILY;COUNT=3' };
      const now = new Date('2023-02-13');
      const result = checkDate(rule, now);
      expect(result).toBe(true);
    });
  });
});
