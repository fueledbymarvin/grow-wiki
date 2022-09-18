import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import axios from "axios";
import App from "../App";

axios.defaults.adapter = require("axios/lib/adapters/http");

const queryClient = new QueryClient({
  logger: {
    log: console.log,
    warn: console.warn,
    error: process.env.NODE_ENV === "test" ? () => {} : console.error,
  },
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQuery = (children: JSX.Element) =>
  render(
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

beforeEach(() => {
  jest.useFakeTimers();
  if (!nock.isActive()) nock.activate();
});

afterEach(() => {
  jest.useRealTimers();
  nock.restore();
  queryClient.clear();
});

test("loads and displays greeting", async () => {
  renderWithQuery(<App />);
  expect(screen.getByText("hello")).toBeInTheDocument();
});
