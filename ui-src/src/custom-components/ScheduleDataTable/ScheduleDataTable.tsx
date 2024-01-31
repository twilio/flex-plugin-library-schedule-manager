import React, { useEffect, useState } from 'react';
import { ColumnDefinition, DataTable } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import { PlusIcon } from '@twilio-paste/icons/cjs/PlusIcon';

import ScheduleEditor from '../ScheduleEditor/ScheduleEditor';
import { Rule, Schedule } from '../../types/schedule-manager';
import ScheduleManagerStrings, { StringTemplates } from '../../flex-hooks/strings/ScheduleManager';
import { TableContainer } from '../ScheduleView/ScheduleViewStyles';
import {
  Badge,
  Flex,
  Popover,
  PopoverButton,
  PopoverContainer,
  Tooltip,
  UseToasterReturnedProps,
} from '@twilio-paste/core';
import StatusBadge from '../common/StatusBadge';
import SchedulesAction from '../common/SchedulesAction';
import AlertBox from '../common/AlertBox';
import { updateScheduleData } from '../../utils/schedule-manager';
import { analytics, Event } from '../../utils/Analytics';
import { ProcessSuccessIcon } from '@twilio-paste/icons/cjs/ProcessSuccessIcon';
import { ProcessWarningIcon } from '@twilio-paste/icons/cjs/ProcessWarningIcon';

interface OwnProps {
  isLoading: boolean;
  rules: Rule[];
  schedules: Schedule[];
  updateSchedules: (schedules: Schedule[]) => void;
  updated: Date;
  toaster: UseToasterReturnedProps;
}

const ScheduleDataTable = (props: OwnProps) => {
  const maxRulesLength = 60;

  const [showPanel, setShowPanel] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null as Schedule | null);
  const [statusTimestamp, setStatusTimestamp] = useState('');
  const [deleteSchedule, setDeleteSchedule] = useState(null as Schedule | null);
  const [copySchedule, setCopySchedule] = useState(false);

  useEffect(() => {
    setStatusTimestamp(`${props.updated.toLocaleTimeString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`);
  }, [props.updated]);

  useEffect(() => {
    if (selectedSchedule !== null) {
      setShowPanel(true);
    }
  }, [selectedSchedule]);

  const createScheduleClick = () => {
    analytics.track(Event.OPHRS_CREATE_SCHEDULE);
    setSelectedSchedule(null);
    setShowPanel(true);
  };

  const onPanelClosed = () => {
    setShowPanel(false);
    setSelectedSchedule(null);
  };

  const getPublishedStatus = (newSchedule: Schedule) => {
    if (newSchedule.isPublished === false || newSchedule.isDeleted === true) {
      return (
        <StatusBadge>
          <ProcessWarningIcon color="colorTextWarningStrong" decorative={false} size="sizeIcon10" title="warning" />
          <Box as="p" color="colorTextWarningStrong" marginLeft="space20">
            {ScheduleManagerStrings[StringTemplates.NOTPUBLISHED]}
          </Box>
        </StatusBadge>
      );
    } else {
      return (
        <StatusBadge>
          <ProcessSuccessIcon color="colorTextIconSuccess" decorative={false} size="sizeIcon10" title="success" />
          <Box as="p" color="colorTextIconSuccess" marginLeft="space20">
            {ScheduleManagerStrings[StringTemplates.PUBLISHED]}
          </Box>
        </StatusBadge>
      );
    }
  };

  const onUpdateSchedule = (newSchedules: Schedule[]) => {
    props.updateSchedules(newSchedules);
    document.querySelector('#schedule-data-table-root')?.scrollIntoView({ behavior: 'smooth' });

    setShowPanel(false);
    setSelectedSchedule(null);
    setCopySchedule(false);
  };

  const onEditOrClone = (item: Schedule, type: string) => {
    if (type == 'copy') {
      analytics.track(Event.OPHRS_DUPLICATE_SCHEDULE, {
        scheduleName: item,
      });
      setCopySchedule(true);
    }
    if (type == 'edit') {
      analytics.track(Event.OPHRS_EDIT_SCHEDULE, {
        scheduleName: item,
      });
    }
    setSelectedSchedule(item);
  };

  const getScheduleStatus = (schedule: Schedule): any => {
    if (schedule.status) {
      const { isOpen, closedReason } = schedule.status;

      if (schedule.manualClose) {
        return (
          <Tooltip text={closedReason}>
            <Badge as="span" variant={schedule.isDeleted ? 'decorative10' : 'warning'}>
              {ScheduleManagerStrings[StringTemplates.MANUALLYCLOSE]}
            </Badge>
          </Tooltip>
        );
      }
      if (isOpen) {
        return (
          <Badge as="span" variant={schedule.isDeleted ? 'decorative10' : 'success'}>
            {ScheduleManagerStrings[StringTemplates.OPEN]}
          </Badge>
        );
      }

      if (closedReason.toLowerCase() === 'closed') {
        return (
          <Badge as="span" variant={schedule.isDeleted ? 'decorative10' : 'warning'}>
            {ScheduleManagerStrings[StringTemplates.CLOSED]}
          </Badge>
        );
      } else {
        return (
          <Badge as="span" variant={schedule.isDeleted ? 'decorative10' : 'warning'}>
            {`${ScheduleManagerStrings[StringTemplates.CLOSED]} (${closedReason})`}
          </Badge>
        );
      }
    }
  };

  const getScheduleRules = (schedule: Schedule): string => {
    const ruleNames = [] as string[];

    schedule.rules.forEach((ruleGuid) => {
      const matchingRule = props.rules.find((rule) => rule.id == ruleGuid);

      if (matchingRule) {
        ruleNames.push(matchingRule.name);
      }
    });

    return ruleNames.join(', ');
  };

  const handleDeleteConfirmSubmit = (): void => {
    if (!deleteSchedule) {
      return;
    }

    deleteSchedule.isDeleted = true;
    const newScheduleData = updateScheduleData(null, deleteSchedule);
    onUpdateSchedule([...newScheduleData]);
    props.toaster.push({
      message: (
        <Box as="p">
          Deleted schedule
          <Box as="strong" fontWeight={'fontWeightSemibold'} marginRight={'space20'} marginLeft={'space20'}>
            {deleteSchedule.name}.
          </Box>
          {ScheduleManagerStrings[StringTemplates.DONT_FORGET_TO_PUBLISH]}
        </Box>
      ),
      variant: 'success',
      dismissAfter: 1000,
    });
    setDeleteSchedule(null);
    setSelectedSchedule(null);
  };

  return (
    <>
      <div id="schedule-data-table-root">
        <Box padding="space60" display={'flex'} justifyContent={'flex-end'}>
          <Button variant="primary" disabled={props.isLoading} onClick={createScheduleClick}>
            <PlusIcon decorative />
            {ScheduleManagerStrings[StringTemplates.CREATE_SCHEDULE_BUTTON]}
          </Button>
        </Box>
        <TableContainer>
          <DataTable items={props.schedules} isLoading={props.isLoading} defaultSortColumn="name-column">
            <ColumnDefinition
              key="name-column"
              header={ScheduleManagerStrings[StringTemplates.SCHEDULE_NAME]}
              sortDirection="asc"
              sortingFn={(a: Schedule, b: Schedule) => (a.name > b.name ? 1 : -1)}
              content={(item: Schedule) => <span className={item.isDeleted ? 'disabled' : ''}>{item.name}</span>}
            />
            <ColumnDefinition
              key="status-column"
              header={ScheduleManagerStrings[StringTemplates.COLUMN_STATUS]}
              subHeader={
                props.isLoading
                  ? ''
                  : `${ScheduleManagerStrings[StringTemplates.COLUMN_STATUS_ASOF]} ${statusTimestamp}`
              }
              sortingFn={(a: Schedule, b: Schedule) => (getScheduleStatus(a) > getScheduleStatus(b) ? 1 : -1)}
              content={(item: Schedule) => getScheduleStatus(item)}
            />
            <ColumnDefinition
              key="rules-column"
              header={ScheduleManagerStrings[StringTemplates.RULES]}
              sortingFn={(a: Schedule, b: Schedule) => (getScheduleRules(a) > getScheduleRules(b) ? 1 : -1)}
              content={(item: Schedule) => {
                const ruleStr = getScheduleRules(item);
                let trimmed = ruleStr;

                if (trimmed.length > maxRulesLength) {
                  trimmed = trimmed.slice(0, maxRulesLength) + '...';
                  return (
                    <PopoverContainer baseId="schedule-rules">
                      <PopoverButton variant="reset">{trimmed}</PopoverButton>
                      <Popover aria-label="Rules Popover">
                        <Box as="h3" fontWeight={'fontWeightSemibold'} fontSize={'fontSize50'} marginBottom={'space30'}>
                          {ScheduleManagerStrings[StringTemplates.RULES_DETAILS_TITLE]}
                        </Box>
                        <Box as="span" className={item.isDeleted ? 'disabled' : ''}>
                          {ruleStr}
                        </Box>
                      </Popover>
                    </PopoverContainer>
                  );
                }

                return <span className={item.isDeleted ? 'disabled' : ''}>{trimmed}</span>;
              }}
            />
            <ColumnDefinition
              key="timezone-column"
              header={ScheduleManagerStrings[StringTemplates.TIMEZONE]}
              sortingFn={(a: Schedule, b: Schedule) => (a.timeZone > b.timeZone ? 1 : -1)}
              content={(item: Schedule) => <span className={item.isDeleted ? 'disabled' : ''}>{item.timeZone}</span>}
            />
            <ColumnDefinition
              key="publish-status-column"
              header={ScheduleManagerStrings[StringTemplates.COLUMN_PUBLISHSTATUS]}
              content={(item: Schedule) => getPublishedStatus(item)}
            />
            <ColumnDefinition
              key="actions-column"
              header=""
              content={(item: Schedule) => (
                <SchedulesAction
                  onCopy={() => {
                    onEditOrClone(item, 'copy');
                  }}
                  deleteDisabled={item.isDeleted}
                  editDisabled={item.isDeleted}
                  copyDisabled={item.isDeleted}
                  onDelete={() => {
                    analytics.track(Event.OPHRS_DELETE_SCHEDULE, {
                      scheduleName: item,
                    });
                    setDeleteSchedule(item);
                  }}
                  onEdit={() => onEditOrClone(item, 'edit')}
                />
              )}
            />
          </DataTable>
        </TableContainer>
      </div>
      <ScheduleEditor
        onPanelClosed={onPanelClosed}
        rules={props.rules}
        showPanel={showPanel}
        onDelete={() => {
          analytics.track(Event.OPHRS_DELETE_SCHEDULE, {
            scheduleName: selectedSchedule,
          });
          setDeleteSchedule(selectedSchedule);
        }}
        copy={copySchedule}
        selectedSchedule={selectedSchedule}
        onUpdateSchedule={onUpdateSchedule}
      />
      <AlertBox
        handleClose={() => setDeleteSchedule(null)}
        isOpen={!!deleteSchedule}
        handleSubmit={() => handleDeleteConfirmSubmit()}
        title={ScheduleManagerStrings[StringTemplates.DELETE_CONFIRM_SCHEDULE_TITLE]}
      >
        <Flex>
          <Box as="p">{ScheduleManagerStrings[StringTemplates.DELETE_CONFIRM_SCHEDULE]}</Box>
          <Box as="strong" fontWeight={'fontWeightSemibold'} marginLeft={'space10'}>
            {deleteSchedule?.name}
          </Box>
        </Flex>
      </AlertBox>
    </>
  );
};

export default ScheduleDataTable;
