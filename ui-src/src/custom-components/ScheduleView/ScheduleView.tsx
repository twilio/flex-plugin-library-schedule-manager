/* eslint-disable no-empty-pattern */
import React, { useEffect, useState } from 'react';
import { Manager, Notifications, Tab, Tabs, withTheme } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Heading } from '@twilio-paste/core/heading';
import { Modal, ModalBody } from '@twilio-paste/core/modal';
import { Spinner } from '@twilio-paste/core/spinner';
import { Stack } from '@twilio-paste/core/stack';
import { Text } from '@twilio-paste/core/text';
import AlertBox from '../common/AlertBox';
import { analytics, Event } from '../../utils/Analytics';

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
import { Box, Callout, CalloutHeading, CalloutText, Disclosure, DisclosureContent, DisclosureHeading, ListItem, Toaster, UnorderedList, useToaster } from '@twilio-paste/core';

const ScheduleView = ({}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isChangesPresent, setChangesPresent] = useState(false);
  const toaster = useToaster();
  const [rules, setRules] = useState([] as Rule[]);
  const [schedules, setSchedules] = useState([] as Schedule[]);
  const [updated, setUpdated] = useState(new Date());
  const [isVersionMismatch, setIsVersionMismatch] = useState(false);
  const [selectedTabName, setSelectedTabName] = React.useState<string>('schedules');
  const [loadFailed, setLoadFailed] = useState(false);
  const [publishState, setPublishState] = useState(0); // 0: normal; 1: publish in progress; 2: publish version error; 3: publish failed; 4: in available activity
  const [isDirty, setIsDirty] = useState(false);
  const [cancelSchedule, setCancelSchedule] = useState(false);

  useEffect(() => {
    listSchedules();
    analytics.page(Event.OPHRS_SCHEDULE_LIST);
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

  useEffect(() => {
    const unpublishedSchedules = schedules.filter(
      (schedule) => schedule.isPublished === false || schedule.isDeleted === true,
    );
    const unpublishedRules = rules.filter((rule) => rule.isPublished === false || rule.isDeleted === true);
    setChangesPresent(unpublishedSchedules.length > 0 || unpublishedRules.length > 0);
  }, [schedules, rules]);

  const updateSchedules = (newSchedules: Schedule[]) => {
    setSchedules(newSchedules);
  };

  const updateRules = (newRules: Rule[]) => {
    setRules(newRules);
  };

  const publish = async () => {
    analytics.track(Event.OPHRS_PUBLISH_SCHEDULE);
    setPublishState(1);
    const publishResult = await publishSchedules();
    setPublishState(publishResult);

    switch (publishResult) {
      case 0:
        setIsDirty(false);
        toaster.push({
          message: <Box as="p">{ScheduleManagerStrings[StringTemplates.SUCCESFULLY_PUBLISHED_CHANGES]}</Box>,
          variant: 'success',
          dismissAfter: 4000,
        });
        await listSchedules();
        break;
      case 2:
        toaster.push({
          message: <Box as="p">{ScheduleManagerStrings[StringTemplates.PUBLISH_FAILED_OTHER_UPDATE]}</Box>,
          variant: 'error',
          dismissAfter: 4000,
        });
        break;
      case 3:
        toaster.push({
          message: <Box as="p">{ScheduleManagerStrings[StringTemplates.PUBLISH_FAILED]}</Box>,
          variant: 'error',
          dismissAfter: 4000,
        });
        break;
      case 4:
        toaster.push({
          message: <Box as="p">{ScheduleManagerStrings[StringTemplates.PUBLISH_FAILED_ACTIVITY]}</Box>,
          variant: 'error',
          dismissAfter: 4000,
        });
        break;

      default:
        break;
    }
  };

  const handleCancelConfirmSubmit = (): void => {
    analytics.track(Event.OPHRS_RESET_SCHEDULE);
    listSchedules();
    setCancelSchedule(false);
  };

  return (
    <ScheduleViewWrapper isLight={Manager.getInstance().store.getState().flex.config?.theme?.isLight}>
      <ScheduleViewHeader>
        <Heading as="h3" variant="heading30" marginBottom="space0" data-testid="schedule-manager-title">
          {ScheduleManagerStrings[StringTemplates.SCHEDULE_MANAGER_TITLE]}
        </Heading>
        <Box marginTop={'space30'} className="schedule-manager-info-text">
          <Disclosure>
            <DisclosureHeading as="h2" variant="heading50">
              {ScheduleManagerStrings[StringTemplates.INFO_SECTION_HEADER]}
            </DisclosureHeading>
            <DisclosureContent>
              <UnorderedList>
                <ListItem>{ScheduleManagerStrings[StringTemplates.INFO_SECTION_DESC_TEXT1]}</ListItem>
                <ListItem>{ScheduleManagerStrings[StringTemplates.INFO_SECTION_DESC_TEXT2]}</ListItem>
                <ListItem>{ScheduleManagerStrings[StringTemplates.INFO_SECTION_DESC_TEXT3]}</ListItem>
              </UnorderedList>
            </DisclosureContent>
          </Disclosure>
        </Box>

        {isChangesPresent && (
          <Callout variant="warning" marginY={'space40'}>
            <CalloutHeading as="h2">{ScheduleManagerStrings[StringTemplates.UNPUBLISHED_CHANGES]}</CalloutHeading>
            <CalloutText>
              {ScheduleManagerStrings[StringTemplates.UNPUBLISHED_CHANGES_TEXT]}
              <strong>{ScheduleManagerStrings[StringTemplates.PUBLISH_BUTTON]}</strong>
              {ScheduleManagerStrings[StringTemplates.UNPUBLISHED_CHANGES_TEXT2]}
            </CalloutText>
          </Callout>
        )}
      </ScheduleViewHeader>
      <Tabs
        key="schedule-manager-tabs"
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
            toaster={toaster}
          />
        </Tab>
        <Tab label={ScheduleManagerStrings[StringTemplates.TAB_RULES]} key="rules" uniqueName="rules">
          <RuleDataTable
            isLoading={isLoading}
            rules={rules}
            schedules={schedules}
            updateRules={updateRules}
            toaster={toaster}
          />
        </Tab>
      </Tabs>
      <PublishActionContainer>
        <Stack orientation="horizontal" spacing="space30">
          <Button variant="primary" onClick={publish} disabled={!isChangesPresent}>
            {ScheduleManagerStrings[StringTemplates.PUBLISH_BUTTON]}
          </Button>
          <Button variant="secondary" onClick={() => setCancelSchedule(true)} disabled={!isChangesPresent}>
            {ScheduleManagerStrings[StringTemplates.CANCEL_BUTTON]}
          </Button>
        </Stack>
      </PublishActionContainer>
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
      <AlertBox
        handleClose={() => {
          setCancelSchedule(false);
        }}
        isOpen={!!cancelSchedule}
        handleSubmit={() => handleCancelConfirmSubmit()}
        title={ScheduleManagerStrings[StringTemplates.CANCEL_PUBLISHING_TEXT]}
      >
        <Box as="div" margin={'space10'}>
          <Box as="span">{ScheduleManagerStrings[StringTemplates.CANCEL_PUBLISHING_TEXT2]}</Box>
          <Box as="strong" fontWeight={'fontWeightSemibold'} marginLeft={'space10'}>
            {ScheduleManagerStrings[StringTemplates.CANCEL_PUBLISHING_TEXT3]}
          </Box>
          <Box as="span" marginLeft={'space10'}>
            {ScheduleManagerStrings[StringTemplates.CANCEL_PUBLISHING_TEXT4]}
          </Box>
        </Box>
      </AlertBox>
      <Toaster {...toaster} />
    </ScheduleViewWrapper>
  );
};

export default ScheduleView;
