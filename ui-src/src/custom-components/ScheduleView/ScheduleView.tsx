/* eslint-disable no-empty-pattern */
import React, { useEffect, useState } from 'react';
import { Notifications, Tab, Tabs } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Heading } from '@twilio-paste/core/heading';
import { Modal, ModalBody } from '@twilio-paste/core/modal';
import { Spinner } from '@twilio-paste/core/spinner';
import { Stack } from '@twilio-paste/core/stack';
import { WarningIcon } from '@twilio-paste/icons/cjs/WarningIcon';
import { Text } from '@twilio-paste/core/text';
import RuleEditor from '../RuleEditor/RuleEditor';
import ScheduleEditor from '../ScheduleEditor/ScheduleEditor';

import {
  PublishModalContent,
  ScheduleViewWrapper,
  ScheduleViewHeader,
  PublishActionContainer,
} from './ScheduleViewStyles';

import RuleDataTable from '../RuleDataTable/RuleDataTable';
import ScheduleDataTable from '../ScheduleDataTable/ScheduleDataTable';
import { Rule, Schedule } from '../../types/schedule-manager';
import { loadScheduleData, publishSchedules } from '../../utils/schedule-manager';
import { NotificationIds } from '../../flex-hooks/notifications/ScheduleManager';
import ScheduleManagerStrings, { StringTemplates } from '../../flex-hooks/strings/ScheduleManager';
import { Alert } from '@twilio-paste/core/alert';
import { Box, Callout, CalloutHeading, CalloutText } from '@twilio-paste/core';
import EditorPanel from 'custom-components/common/EditorPanel';

const ScheduleView = ({}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [rules, setRules] = useState([] as Rule[]);
  const [schedules, setSchedules] = useState([] as Schedule[]);
  const [updated, setUpdated] = useState(new Date());
  const [showPanel, setShowPanel] = useState(false);
  const [isVersionMismatch, setIsVersionMismatch] = useState(false);
  const [selectedTabName, setSelectedTabName] = React.useState<string>('schedules');
  const [loadFailed, setLoadFailed] = useState(false);
  const [publishState, setPublishState] = useState(0); // 0: normal; 1: publish in progress; 2: publish version error; 3: publish failed; 4: in available activity
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    listSchedules();

    return () => {
      if (publishState == 1) {
        Notifications.showNotification(NotificationIds.PUBLISH_ABORTED);
      }
    };
  }, []);

  const listSchedules = async () => {
    setIsLoading(true);

    const scheduleData = await loadScheduleData();

    if (scheduleData === null) {
      setLoadFailed(true);
    } else {
      setLoadFailed(false);
      setRules(scheduleData.data.rules);
      setSchedules(scheduleData.data.schedules);
      setUpdated(new Date());
      setIsVersionMismatch(scheduleData.versionIsDeployed === false);
    }

    setIsLoading(false);
  };

  const updateSchedules = (newSchedules: Schedule[]) => {
    setSchedules(newSchedules);
    setIsDirty(true);
  };

  const updateRules = (newRules: Rule[]) => {
    setRules(newRules);
    setIsDirty(true);
  };

  const publish = async () => {
    setPublishState(1);
    const publishResult = await publishSchedules();
    setPublishState(publishResult);

    if (publishResult == 0) {
      setIsDirty(false);
      await listSchedules();
    }
  };

  return (
    <ScheduleViewWrapper>
      <ScheduleViewHeader>
        <Heading as="h3" variant="heading30" marginBottom="space0" data-testid="schedule-manager-title">
          {ScheduleManagerStrings[StringTemplates.SCHEDULE_MANAGER_TITLE]}
        </Heading>

        {/* <Box variant="warning" display={'flex'} >
          <WarningIcon decorative={false} title="Description of icon" size={}/>
          <Box>
            <strong>Unpublished changes</strong>
            <p>
              You have 1 unpublished change. Your changes will be lost. please click <strong>Publish changes</strong> to
              complete process
            </p>
          </Box>
        </Box> */}
        {/* <AlertContainer>
          <Alert variant="warning">
            <Text as="strong" marginLeft={'space20'}>
              Unpublished changes
            </Text>
            <Text as="p" marginTop={'space30'} marginLeft={'space20'}>
              You have 1 unpublished change. Your changes will be lost. please click <strong>Publish changes</strong> to
              complete process
            </Text>
          </Alert>
        </AlertContainer> */}
        <Callout variant="warning">
          <CalloutHeading as="h2">{ScheduleManagerStrings[StringTemplates.UNPUBLISHED_CHANGES]}</CalloutHeading>
          <CalloutText>{ScheduleManagerStrings[StringTemplates.UNPUBLISHED_CHANGES_TEXT]}</CalloutText>
        </Callout>
      </ScheduleViewHeader>
      <Tabs
        key="operating-hours-tabs"
        selectedTabName={selectedTabName}
        onTabSelected={(tabName) => setSelectedTabName(tabName)}
      >
        <Tab label={ScheduleManagerStrings[StringTemplates.TAB_SCHEDULES]} key="schedules" uniqueName="schedules">
          <ScheduleDataTable
            isLoading={isLoading}
            rules={rules}
            schedules={schedules}
            updateSchedules={updateSchedules}
            updated={updated}
          />
        </Tab>
        <Tab label={ScheduleManagerStrings[StringTemplates.TAB_RULES]} key="rules" uniqueName="rules">
          <RuleDataTable isLoading={isLoading} rules={rules} schedules={schedules} updateRules={updateRules} />
        </Tab>
      </Tabs>
      <PublishActionContainer>
        <Stack orientation="horizontal" spacing="space30">
          <Button variant="primary" onClick={publish}>
            {ScheduleManagerStrings[StringTemplates.PUBLISH_BUTTON]}
          </Button>
          <Button variant="secondary" onClick={publish}>
            Cancel
          </Button>
        </Stack>
      </PublishActionContainer>
      {/* <EditorPanel
        onPanelClosed={onPanelClosed}
        showPanel={showPanel}
        title={title}
        children={title.indexOf('rule') > -1 ? <RuleEditor /> : <ScheduleEditor />}
      /> */}
      <Modal isOpen={publishState === 1} onDismiss={() => {}} size="default" ariaLabelledby="">
        <ModalBody>
          <PublishModalContent>
            <Stack orientation="horizontal" spacing="space60">
              <Spinner decorative={true} size="sizeIcon100" title="Please wait..." />
              <Stack orientation="vertical" spacing="space20">
                <Heading as="h3" variant="heading30" marginBottom="space0">
                  {ScheduleManagerStrings[StringTemplates.PUBLISH_DIALOG_TITLE]}
                </Heading>
                <Text as="p">{ScheduleManagerStrings[StringTemplates.PUBLISH_DIALOG_TEXT]}</Text>
              </Stack>
            </Stack>
          </PublishModalContent>
        </ModalBody>
      </Modal>
      <Modal isOpen={loadFailed} onDismiss={() => {}} size="default" ariaLabelledby="">
        <ModalBody>
          <PublishModalContent>
            <Stack orientation="vertical" spacing="space20">
              <Heading as="h3" variant="heading30" marginBottom="space0">
                {ScheduleManagerStrings[StringTemplates.LOAD_FAILED_TITLE]}
              </Heading>
              <Text as="p">{ScheduleManagerStrings[StringTemplates.LOAD_FAILED_TEXT]}</Text>
            </Stack>
          </PublishModalContent>
        </ModalBody>
      </Modal>
    </ScheduleViewWrapper>
  );
};

export default ScheduleView;
