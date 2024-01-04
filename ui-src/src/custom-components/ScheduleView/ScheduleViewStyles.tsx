import { styled } from '@twilio/flex-ui';

export const ScheduleViewWrapper = styled('div')`
  display: flex;
  height: 100%;
  flex-flow: column;
  flex-grow: 1;
  flex-shrink: 1;

  .editor {
    width: 40vw;
    position: fixed;
    right: 0;
    top: 52px;
    background: white;
    z-index: 2;
    height: 95vh;
  }
`;

export const ScheduleViewHeader = styled('div')`
  display: flex;
  flex-direction: column;
  padding: 1em;

  strong, h2 {
    font-weight: 600;
    color: inherit;
  }
`;

export const RulesContainer = styled('div')`
  width: 100%;
  overflow: auto;
  max-height: 25vh;

  h4 {
    background-color: rgb(244, 244, 246);
    padding: 1em 0 1em 2em;
    font-weight: 600;
  }
`;

export const PublishModalContent = styled('div')`
  display: flex;
  justify-content: center;
  padding-top: 3em;
`;

export const PublishActionContainer = styled('div')`
  margin: 1em;
`;

export const TableContainer = styled('div')`
  overflow: auto;
  height: 80%;
  margin: 0 1em;
  box-sizing: border-box;

  table {
    border: 1px solid #e1e3ea;
  }
  td:nth-of-type(3),
  th:nth-of-type(3) {
    width: 30%;
  }
  td .disabled {
    color: #e1e3ea;
  }
`;