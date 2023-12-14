import React, { useEffect, useState } from 'react';
import tzdata from 'tzdata';
import { ColumnDefinition, DataTable, SidePanel } from '@twilio/flex-ui';
import { Alert } from '@twilio-paste/core/alert';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import { Checkbox } from '@twilio-paste/core/checkbox';
import { Combobox, UseComboboxState, useCombobox } from '@twilio-paste/core/combobox';
import { Heading } from '@twilio-paste/core/heading';
import { HelpText } from '@twilio-paste/core/help-text';
import { Input } from '@twilio-paste/core/input';
import { Label } from '@twilio-paste/core/label';
import { Stack } from '@twilio-paste/core/stack';
import { ChevronDownIcon } from '@twilio-paste/icons/cjs/ChevronDownIcon';
import { ChevronUpIcon } from '@twilio-paste/icons/cjs/ChevronUpIcon';
import { DeleteIcon } from '@twilio-paste/icons/cjs/DeleteIcon';

import { isScheduleUnique, updateScheduleData } from '../../utils/schedule-manager';
import { Schedule, Rule } from '../../types/schedule-manager';
import ScheduleManagerStrings, { StringTemplates } from '../../flex-hooks/strings/ScheduleManager';
import EditorPanel from '../common/EditorPanel';
import { SortableList } from '../common/Sortable/SortableList';
import { RuleDragHandle } from './RuleDragHandle';
import { RulesContainer } from '../ScheduleView/ScheduleViewStyles';

interface OwnProps {
  onPanelClosed: () => void;
  rules: Rule[];
  copy: boolean;
  showPanel: boolean;
  selectedSchedule: Schedule | null;
  onUpdateSchedule: (schedules: Schedule[]) => void;
}

const ScheduleEditor = (props: OwnProps) => {
  const [filteredTimeZones, setFilteredTimeZones] = useState([] as string[]);
  const [timeZones, setTimeZones] = useState([] as string[]);

  const [name, setName] = useState('');
  const [manualClose, setManualClose] = useState(false);
  const [timeZone, setTimeZone] = useState('');
  const [rules, setRules] = useState([] as Rule[]);
  const [filteredRules, setFilteredRules] = useState([] as Rule[]);
  const [addRuleInput, setAddRuleInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const zones = [];
    for (const [key, _value] of Object.entries(tzdata.zones)) {
      zones.push(key);
    }

    setTimeZones(zones.sort());
  }, []);

  useEffect(() => {
    resetView();

    if (!props.selectedSchedule) {
      return;
    }

    setName(props.selectedSchedule.name);
    setManualClose(props.selectedSchedule.manualClose);
    setTimeZone(props.selectedSchedule.timeZone);

    const rules = [] as Rule[];

    props.selectedSchedule.rules.forEach((ruleGuid) => {
      const matchingRule = props.rules.find((rule) => rule.id == ruleGuid);

      if (matchingRule) {
        rules.push(matchingRule);
      }
    });

    setRules(rules);
  }, [props.selectedSchedule]);

  useEffect(() => {
    if (!props.showPanel) {
      resetView();
    }
  }, [props.showPanel]);

  useEffect(() => {
    const filtered = props.rules.filter((rule) => {
      // Rule not yet added and matches input text if present
      return (
        rules.indexOf(rule) < 0 && (!addRuleInput || rule.name.toLowerCase().indexOf(addRuleInput.toLowerCase()) >= 0)
      );
    });
    filtered.sort((a, b) => (a.name > b.name ? 1 : -1));

    setFilteredRules(filtered);
  }, [props.rules, rules, addRuleInput]);

  useEffect(() => {
    setFilteredTimeZones(timeZones);
  }, [timeZones]);

  const resetView = () => {
    setName('');
    setManualClose(false);
    setTimeZone('');
    setRules([]);
    setAddRuleInput('');
    setError('');
  };

  const handleChangeName = (event: React.FormEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };

  const handleChangeTimeZone = (changes: Partial<UseComboboxState<string>>) => {
    if (changes.selectedItem) {
      setTimeZone(changes.selectedItem);
    }
  };

  const handleChangeManualClose = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManualClose(event.target.checked);
  };

  const handleAddRule = (changes: Partial<UseComboboxState<Rule>>) => {
    if (changes.selectedItem) {
      setRules([...rules, changes.selectedItem]);
      reset();
    }
  };

  const { reset, ...state } = useCombobox({
    items: filteredRules,
    inputValue: addRuleInput,
    onInputValueChange: ({ inputValue }) => setAddRuleInput(inputValue ?? ''),
    onSelectedItemChange: handleAddRule,
    itemToString: () => '',
  });

  const handleRuleRemove = (rule: Rule) => {
    setRules((rules) => rules.filter((item) => rule.id !== item.id));
  };

  const saveSchedule = () => {
    if (!name) {
      setError(ScheduleManagerStrings[StringTemplates.ERROR_NAME_REQUIRED]);
      return;
    }

    if (!timeZone) {
      setError(ScheduleManagerStrings[StringTemplates.ERROR_TIMEZONE_REQUIRED]);
      return;
    }

    const newSchedule = { name, manualClose, timeZone, rules: rules.map((rule) => rule.id) };

    if (isScheduleUnique(newSchedule, props.selectedSchedule)) {
      setError('');
      const newScheduleData = updateScheduleData(newSchedule, props.selectedSchedule);

      if (props.copy) {
        copySchedule(newSchedule);
      } else {
        props.onUpdateSchedule(newScheduleData);
      }
    } else {
      setError(ScheduleManagerStrings[StringTemplates.ERROR_NAME_UNIQUE]);
    }
  };

  const copySchedule = (schedule: Schedule) => {
    console.log('schedule', schedule);
    const name = schedule.name + ` ${ScheduleManagerStrings[StringTemplates.NAME_COPY]}`;

    const scheduleCopy = {
      ...schedule,
      name,
    };

    console.log('scheduleCopy', scheduleCopy);
    while (!isScheduleUnique(scheduleCopy, null)) {
      scheduleCopy.name = scheduleCopy.name + ` ${ScheduleManagerStrings[StringTemplates.NAME_COPY]}`;
    }

    const scheduleCopyData = updateScheduleData(scheduleCopy, null);
    props.onUpdateSchedule(scheduleCopyData);
  };

  const handleDelete = () => {
    if (!props.selectedSchedule) {
      return;
    }

    const newScheduleData = updateScheduleData(null, props.selectedSchedule);
    props.onUpdateSchedule(newScheduleData);
  };

  return (
    <EditorPanel
      onPanelClosed={props.onPanelClosed}
      showPanel={props.showPanel}
      title={
        <span>
          {props.selectedSchedule === null
            ? ScheduleManagerStrings[StringTemplates.NEW_SCHEDULE_TITLE]
            : ScheduleManagerStrings[StringTemplates.EDIT_SCHEDULE_TITLE]}
        </span>
      }
    >
      <Box padding="space60">
        <Stack orientation="vertical" spacing="space80">
          <>
            <Label htmlFor="name" required>
              {ScheduleManagerStrings[StringTemplates.NAME]}
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={handleChangeName}
              data-testid="schedule-editor-name"
              required
            />
          </>
          <Combobox
            autocomplete
            data-testid="schedule-editor-timezone"
            items={filteredTimeZones}
            labelText={ScheduleManagerStrings[StringTemplates.TIMEZONE]}
            selectedItem={timeZone}
            onSelectedItemChange={handleChangeTimeZone}
            onInputValueChange={({ inputValue }) => {
              if (inputValue) {
                setFilteredTimeZones(
                  timeZones.filter((timeZone) => timeZone.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0),
                );
              } else {
                setFilteredTimeZones(timeZones);
              }
            }}
            required
          />
          <Checkbox
            checked={manualClose}
            onChange={handleChangeManualClose}
            id="manualClose"
            name="manualClose"
            helpText={ScheduleManagerStrings[StringTemplates.MANUALLYCLOSE_TEXT]}
          >
            {ScheduleManagerStrings[StringTemplates.MANUALLYCLOSE]}
          </Checkbox>
          <Combobox
            autocomplete
            items={filteredRules}
            labelText={ScheduleManagerStrings[StringTemplates.ADD_RULE]}
            optionTemplate={(item: Rule) => item.name}
            state={{ ...state }}
            helpText={ScheduleManagerStrings[StringTemplates.RULES_TEXT]}
          />
          <RulesContainer>
            <Box as="h4">{ScheduleManagerStrings[StringTemplates.SCHEDULE_RULES_HEADING]}</Box>
            <SortableList
              items={rules}
              onChange={(items: Array<Rule>) => setRules(items)}
              renderItem={(item) => <RuleDragHandle {...item} onDelete={() => handleRuleRemove(item)} />}
            />
          </RulesContainer>
          {error.length > 0 && <Alert variant="error">{error}</Alert>}
        </Stack>
        <Box position={'fixed'} bottom={'space40'} right={'space60'}>
          <Stack orientation={'horizontal'} spacing="space30">
            {props.selectedSchedule !== null && (
              <Button variant="destructive_link" onClick={handleDelete} data-testid="delete-btn">
                {ScheduleManagerStrings[StringTemplates.DELETE_BUTTON]}
              </Button>
            )}
            <Button variant="secondary" onClick={() => props.onPanelClosed()} data-testid="cancel-btn">
              {ScheduleManagerStrings[StringTemplates.CANCEL_BUTTON]}
            </Button>
            <Button variant="primary" onClick={() => saveSchedule()} data-testid="save-btn">
              {ScheduleManagerStrings[StringTemplates.SAVE_BUTTON]}
            </Button>
          </Stack>
        </Box>
      </Box>
    </EditorPanel>
  );
};

export default ScheduleEditor;
