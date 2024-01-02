import FlexTelemetry from '@twilio/flex-ui-telemetry';
import packageJSON from '../../package.json';

export enum Event {
  OPHRS_SCHEDULE_LIST = 'OpHrs Schedule List',
  OPHRS_CREATE_SCHEDULE = 'OpHrs Create Schedule',
  OPHRS_EDIT_SCHEDULE = 'OpHrs Edit Schedule',
  OPHRS_DUPLICATE_SCHEDULE = 'OpHrs Duplicate Schedule',
  OPHRS_SAVE_SCHEDULE = 'OpHrs Save Schedule',
  OPHRS_DELETE_SCHEDULE = 'OpHrs Delete Schedule',
  OPHRS_PUBLISH_SCHEDULE = 'OpHrs Publish Schedules',
  OPHRS_RESET_SCHEDULE = 'OpHrs Reset Schedules',
  OPHRS_RULE_LIST = 'OpHrs Rule List',
  OPHRS_CREATE_RULE = 'OpHrs Create Rule',
  OPHRS_EDIT_RULE = 'OpHrs Edit Rule',
  OPHRS_DUPLICATE_RULE = 'OpHrs Duplicate Rule',
  OPHRS_SAVE_RULE = 'OpHrs Save Rule',
  DELETE_RULE = 'Delete Rule',
}

export const analytics = new FlexTelemetry({
  source: 'flexui',
  role: packageJSON.name,
  plugin: packageJSON.name,
  pluginVersion: packageJSON.version,
  originalPluginName: packageJSON.id,
});
