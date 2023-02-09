import React from "react";
import { render, waitFor } from "@testing-library/react";
import ScheduleSideLink from "../ScheduleSideLink";

describe("ScheduleSideLink component", () => {
    test("renders correctly", () => {
        const sideLink = render(<ScheduleSideLink viewName="sample" activeView="sample" />)
        expect(sideLink).toMatchSnapshot();
    });
});
