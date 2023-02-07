import React from "react";
import { render, waitFor } from "@testing-library/react";
import ScheduleView from "../ScheduleView";
import * as utils from "../../../utils/schedule-manager";

describe("ScheduleView component", () => {
    test("renders correct data loaded from serverless", async () => {
        const dataPromise: Promise<any> = new Promise((resolve) => {
            resolve({
                data: {
                    rules: [
                        {
                            id: "eee7d8eb-f966-4a23-8743-ec3452cd11ad",
                            name: "July 4th",
                            isOpen: false,
                            closedReason: "holiday",
                            dateRRule:
                                "RRULE:FREQ=YEARLY;BYMONTH=7;BYMONTHDAY=4",
                        },
                        {
                            id: "21cc41d6-9f4a-4e49-b61b-bcd5cf94d870",
                            name: "Labor Day",
                            isOpen: false,
                            closedReason: "holiday",
                            startDate: "2023-09-04",
                            endDate: "2023-09-04",
                        },
                        {
                            id: "61703be8-412c-4bd5-8a6b-afe7e9ecb304",
                            name: "Thanksgiving Day",
                            isOpen: false,
                            closedReason: "holiday",
                            startDate: "2023-11-23",
                            endDate: "2023-11-23",
                        },
                        {
                            id: "b2b4ae7b-d491-46dd-b387-1321c88ac50a",
                            name: "Memorial Day",
                            isOpen: false,
                            closedReason: "holiday",
                            startDate: "2023-05-29",
                            endDate: "2023-05-29",
                        },
                        {
                            id: "c4d10897-63b8-485e-bd8a-0db23276dec8",
                            name: "Christmas Day",
                            isOpen: false,
                            closedReason: "holiday",
                            dateRRule:
                                "RRULE:FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25",
                        },
                        {
                            id: "0f437b04-5d8e-46ce-824f-3591375f9beb",
                            name: "Martin Luther King Jr. Day",
                            isOpen: false,
                            closedReason: "holiday",
                            startDate: "2023-01-16",
                            endDate: "2023-01-16",
                        },
                        {
                            id: "cda1c3fb-39ab-4a25-9342-6bef21ede470",
                            name: "Presidents' Day",
                            isOpen: false,
                            closedReason: "holiday",
                            startDate: "2023-02-20",
                            endDate: "2023-02-20",
                        },
                        {
                            id: "4f6f2952-fa96-4047-b52f-81ed7e8dacd2",
                            name: "Juneteenth",
                            isOpen: false,
                            closedReason: "holiday",
                            dateRRule:
                                "RRULE:FREQ=YEARLY;BYMONTH=6;BYMONTHDAY=19",
                        },
                        {
                            id: "51800893-7050-413d-a692-201e3d0161b6",
                            name: "Veterans Day",
                            isOpen: false,
                            closedReason: "holiday",
                            dateRRule:
                                "RRULE:FREQ=YEARLY;BYMONTH=11;BYMONTHDAY=11",
                        },
                        {
                            id: "46c34f64-1efb-4453-9178-1ae6573d13ae",
                            name: "New Year's Day",
                            isOpen: false,
                            closedReason: "holiday",
                            dateRRule:
                                "RRULE:FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1",
                        },
                        {
                            id: "947f978a-0196-40f0-998e-df4f3a78f1dc",
                            name: "Diwali",
                            isOpen: false,
                            closedReason: "holiday",
                            startDate: "2023-11-12",
                            endDate: "2023-11-12",
                        },
                        {
                            id: "aa7576fa-fa8e-474d-8414-3cbe222c8c57",
                            name: "Closed on 24th Jan 23",
                            isOpen: false,
                            closedReason: "closed",
                            startDate: "2023-01-24",
                            endDate: "2023-01-24",
                        },
                    ],
                    schedules: [
                        {
                            name: "Example",
                            manualClose: false,
                            timeZone: "America/Chicago",
                            rules: [
                                "5c0c7b9c-787f-4245-bb5b-b31160cb3ec5",
                                "c4d10897-63b8-485e-bd8a-0db23276dec8",
                                "eee7d8eb-f966-4a23-8743-ec3452cd11ad",
                                "4f6f2952-fa96-4047-b52f-81ed7e8dacd2",
                                "21cc41d6-9f4a-4e49-b61b-bcd5cf94d870",
                                "0f437b04-5d8e-46ce-824f-3591375f9beb",
                                "b2b4ae7b-d491-46dd-b387-1321c88ac50a",
                                "46c34f64-1efb-4453-9178-1ae6573d13ae",
                                "cda1c3fb-39ab-4a25-9342-6bef21ede470",
                                "61703be8-412c-4bd5-8a6b-afe7e9ecb304",
                                "51800893-7050-413d-a692-201e3d0161b6",
                            ],
                            status: {
                                isOpen: false,
                                closedReason: "closed",
                            },
                        },
                        {
                            name: "Closed on Diwali",
                            manualClose: false,
                            timeZone: "Asia/Kolkata",
                            rules: [
                                "947f978a-0196-40f0-998e-df4f3a78f1dc",
                                "aa7576fa-fa8e-474d-8414-3cbe222c8c57",
                            ],
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
