import React, { useEffect, useState } from 'react';
import { ColumnDefinition, DataTable } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import { PlusIcon } from '@twilio-paste/icons/cjs/PlusIcon';
import { RRule } from 'rrule';

import RuleEditor from '../RuleEditor/RuleEditor';
import { Rule, Schedule } from '../../types/schedule-manager';
import ScheduleManagerStrings, { StringTemplates } from '../../flex-hooks/strings/ScheduleManager';
import RRuleLanguage from '../../utils/RRuleLanguage';
import { TableContainer } from '../ScheduleView/ScheduleViewStyles';
import SchedulesAction from '../common/SchedulesAction';
import { Badge, Flex } from '@twilio-paste/core';
import { StatusBadge } from '@twilio-paste/status';
import AlertBox from '../common/AlertBox';
import { updateRuleData } from '../../utils/schedule-manager';

interface OwnProps {
  isLoading: boolean;
  rules: Rule[];
  schedules: Schedule[];
  updateRules: (rules: Rule[]) => void;
}

const RuleDataTable = (props: OwnProps) => {
  const [showPanel, setShowPanel] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null as Rule | null);
  // const [openIndexNext, setOpenIndexNext] = useState(null as number | null);
  const [deleteRule, setDeleteRule] = useState(null as Rule | null);
  const [copyRule, setCopyRule] = useState(false);

  // useEffect(() => {
  //   if (openIndexNext) {
  //     setCopySchedule(false);
  //     setSelectedRule(props.rules[openIndexNext]);
  //     setOpenIndexNext(null);
  //   }
  // }, [props.rules]);

  useEffect(() => {
    if (selectedRule !== null) {
      setShowPanel(true);
    }
  }, [selectedRule]);

  const createRuleClick = () => {
    setSelectedRule(null);
    setShowPanel(true);
  };

  const onPanelClosed = () => {
    setShowPanel(false);
    setSelectedRule(null);
  };

  const onEditOrClone = (item: Rule, type: string) => {
    if (type == 'copy') {
      setCopyRule(true);
    }
    setSelectedRule(item);
  };

  const onUpdateRule = (newRules: Rule[]) => {
    // if (openIndex) {
    //   setOpenIndexNext(openIndex);
    // }

    props.updateRules(newRules);
    document.querySelector('#rule-data-table-root')?.scrollIntoView({ behavior: 'smooth' });
    setShowPanel(false);
    setSelectedRule(null);
    setCopyRule(false);

    // if (!openIndex) {
    //   setShowPanel(false);
    //   setSelectedRule(null);
    // }
  };

  const getRuleRecurrence = (rule: Rule): string => {
    let recStr = ScheduleManagerStrings[StringTemplates.ONE_TIME];

    if (rule.dateRRule) {
      const freq = RRule.fromString(rule.dateRRule).options.freq;
      switch (freq) {
        case 0:
          recStr = 'Every year';
          break;
        case 1:
          recStr = 'Every month';
          break;
        case 2:
          recStr = 'Every week';
          break;
        case 3:
          recStr = 'Daily';
          break;
        default:
          break;
      }
      return recStr;
    }
    return recStr;
  };

  const getRuleTime = (rule: Rule): any => {
    let timeStr = ScheduleManagerStrings[StringTemplates.ANY_TIME];
    if (rule.isOpen) {
      if (rule.startTime) {
        timeStr = rule.startTime;
      }

      if (rule.endTime) {
        timeStr += ` - ${rule.endTime}`;
      }

      return (
        <Badge as="span" variant="success">
          {`Open ${timeStr}`}
        </Badge>
      );
    } else {
      timeStr = ScheduleManagerStrings[StringTemplates.CLOSEDALLDAY];

      // if (rule.closedReason && rule.closedReason !== 'closed') {
      //   timeStr += ` (${rule.closedReason})`;
      // }
      return (
        <Badge as="span" variant="warning">
          {timeStr}
        </Badge>
      );
    }
  };

  const getRuleDate = (rule: Rule): string => {
    let dateStr = ScheduleManagerStrings[StringTemplates.ANY_DAY];

    if (rule.startDate && rule.endDate && rule.startDate == rule.endDate) {
      dateStr = `${rule.startDate}`;
    } else {
      dateStr = '';

      if (rule.dateRRule) {
        const text = RRule.fromString(rule.dateRRule).toText(undefined, RRuleLanguage);
        dateStr += text.charAt(0).toUpperCase() + text.slice(1);
      }

      if (dateStr && (rule.startDate || rule.endDate)) {
        dateStr += ', ';
      }

      if (rule.startDate) {
        dateStr += `${ScheduleManagerStrings[StringTemplates.DATE_FROM]} ${rule.startDate}`;
      }

      if (rule.endDate) {
        if (dateStr) {
          dateStr += ' ';
        }
        dateStr += `${ScheduleManagerStrings[StringTemplates.DATE_UNTIL]} ${rule.endDate}`;
      }
    }

    return dateStr;
  };

  const handleDeleteConfirmSubmit = (): void => {
    if (!deleteRule) {
      return;
    }

    const newScheduleData = updateRuleData(null, deleteRule);
    onUpdateRule(newScheduleData);
  };

  return (
    <>
      <div id="rule-data-table-root">
        <Box padding="space60" display={'flex'} justifyContent={'flex-end'}>
          <Button variant="primary" data-testid="create-rule-btn" disabled={props.isLoading} onClick={createRuleClick}>
            <PlusIcon decorative />
            {ScheduleManagerStrings[StringTemplates.CREATE_RULE_BUTTON]}
          </Button>
        </Box>
        <TableContainer>
          <DataTable
            items={props.rules}
            isLoading={props.isLoading}
            // onRowClick={onRowClick}
            defaultSortColumn="name-column"
          >
            <ColumnDefinition
              key="name-column"
              header={ScheduleManagerStrings[StringTemplates.NAME]}
              sortDirection="asc"
              sortingFn={(a: Rule, b: Rule) => (a.name > b.name ? 1 : -1)}
              content={(item: Rule) => <span id={item.name}>{item.name}</span>}
            />
            <ColumnDefinition
              key="time-column"
              header={ScheduleManagerStrings[StringTemplates.TIME]}
              sortingFn={(a: Rule, b: Rule) => (getRuleTime(a) > getRuleTime(b) ? 1 : -1)}
              content={(item: Rule) => getRuleTime(item)}
            />
            <ColumnDefinition
              key="date-column"
              header={ScheduleManagerStrings[StringTemplates.DATE]}
              sortingFn={(a: Rule, b: Rule) => (getRuleDate(a) > getRuleDate(b) ? 1 : -1)}
              content={(item: Rule) => <span>{getRuleDate(item)}</span>}
            />
            <ColumnDefinition
              key="recurrence-column"
              header={ScheduleManagerStrings[StringTemplates.DATE]}
              sortingFn={(a: Rule, b: Rule) => (getRuleDate(a) > getRuleDate(b) ? 1 : -1)}
              content={(item: Rule) => <span>{getRuleRecurrence(item)}</span>}
            />
            <ColumnDefinition
              key="publish-status-column"
              header={ScheduleManagerStrings[StringTemplates.COLUMN_PUBLISHSTATUS]}
              // sortingFn={(a: Rule, b: Rule) => (a.manualClose ? 1 : -1)}
              content={(item: Rule) => (
                <StatusBadge as="span" variant="ProcessSuccess">
                  Published
                </StatusBadge>
              )}
            />
            <ColumnDefinition
              key="actions-column"
              header=""
              // sortingFn={(a: Rule, b: Rule) => (a.manualClose ? 1 : -1)}
              content={(item: Rule) => (
                <SchedulesAction
                  onCopy={() => {
                    onEditOrClone(item, 'copy');
                  }}
                  onDelete={() => setDeleteRule(item)}
                  onEdit={() => onEditOrClone(item, 'edit')}
                />
              )}
            />
          </DataTable>
        </TableContainer>
      </div>
      <RuleEditor
        onPanelClosed={onPanelClosed}
        showPanel={showPanel}
        copy={copyRule}
        schedules={props.schedules}
        selectedRule={selectedRule}
        onUpdateRule={onUpdateRule}
      />
      <AlertBox
        handleClose={() => setDeleteRule(null)}
        isOpen={!!deleteRule}
        handleSubmit={() => handleDeleteConfirmSubmit()}
        title={'Delete schedule'}
      >
        <Flex>
          <Box as="p">{ScheduleManagerStrings[StringTemplates.DELETE_CONFIRM_RULE]}</Box>
          <Box as="strong" fontWeight={'fontWeightSemibold'} marginLeft={'space10'}>
            {deleteRule?.name}
          </Box>
        </Flex>
      </AlertBox>
    </>
  );
};

export default RuleDataTable;
