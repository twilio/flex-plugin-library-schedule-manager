import React from "react";
import { render, waitFor } from "@testing-library/react";
import ScheduleView from "../ScheduleView";
import * as utils from "../../../utils/schedule-manager";

describe("ScheduleView component", () => {
    test("renders correct data loaded from serverless", async () => {
        const dataPromise: Promise<any> = new Promise((resolve) => {
            resolve({
                data: {
                    rules: [],
                    schedules: [
                        {
                            name: "Example",
                            manualClose: false,
                            timeZone: "America/Chicago",
                            rules: [],
                            status: {
                                isOpen: false,
                                closedReason: "closed",
                            },
                        },
                        {
                            name: "Closed on Diwali",
                            manualClose: false,
                            timeZone: "Asia/Kolkata",
                            rules: [],
                            status: {
                                isOpen: false,
                                closedReason: "closed",
                            },
                        },
                    ],
                },
                version: "ZNd6b4b840cc2e20664cd9c7895487261d",
                versionIsDeployed: true,
            });
        });
        const listMock = jest
            .spyOn(utils, "loadScheduleData")
            .mockReturnValue(dataPromise);
        const scheduleView = render(<ScheduleView />);
        await waitFor(() => {
            expect(scheduleView).toMatchSnapshot();
            expect(
                scheduleView.getByTestId("schedule-manager-title").textContent
            ).toBe("Schedule Manager");
        });

        expect(listMock).toHaveBeenCalledTimes(1);
    });
});
