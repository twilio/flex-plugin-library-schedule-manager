import { styled, Theme } from '@twilio/flex-ui';

export const ScheduleViewWrapper = styled('div')<{ isLight: boolean | undefined }>`
  display: flex;
  height: 100%;
  flex-flow: column;
  flex-grow: 1;
  flex-shrink: 1;

  .editor {
    width: 40vw;
    position: fixed;
    right: 0;
    top: 76px;
    background: ${(props) => {
      if (props.isLight) return 'white';
      return 'rgb(13, 19, 28)';
    }};
    z-index: 1000;
    height: 92vh;
  }
  ul {
    list-style: disc;
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

  .schedule-manager-info-text {
    h2 {
      div {
        padding-left: 0;
        z-index: 1;
        font-weight: 400;
        :focus {
          box-shadow: none;
        }
      }
    }
    div[data-paste-element='DISCLOSURE_CONTENT'] {
      padding-top: 0;
      padding-bottom: 0;
    }
  }
`;

export const RulesContainer = styled('div')<{ isLight: boolean | undefined }>`
  width: 100%;

  h4 {
    background-color: ${(props) => {
      if (props.isLight) return 'rgb(244, 244, 246)';
      return 'rgb(13, 19, 28)';
    }};
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

export const TableContainer = styled('div')<{ isLight: boolean | undefined }>`
  overflow: auto;
  height: 80%;
  margin: 0 1em;
  box-sizing: border-box;

  table {
    border: ${(props) => {
      if (props.isLight) return '1px solid #e1e3ea';
      return 'none';
    }};
  }
  td:nth-of-type(3),
  th:nth-of-type(3) {
    width: 30%;
  }
  td .disabled {
    color: #e1e3ea;
  }
`;