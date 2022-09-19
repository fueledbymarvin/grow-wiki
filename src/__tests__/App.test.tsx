import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import axios from "axios";
import App from "../App";
import { API_BASE_URL, ArticleListResponse } from "../utils";

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

const data: ArticleListResponse = {
  items: [
    {
      articles: [
        {
          article: "asdf",
          views: 123,
        },
      ],
    },
  ],
};

test("displays articles on success", async () => {
  const scope = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2015/10/10")
    .reply(200, data);
  renderWithQuery(<App />);
  scope.isDone();
  expect(await screen.findByText("asdf")).toBeInTheDocument();
});

test("shows error state", async () => {
  const scope = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2015/10/10")
    .reply(500);
  renderWithQuery(<App />);
  scope.isDone();
  expect(
    await screen.findByText("Error: Request failed with status code 500")
  ).toBeInTheDocument();
});

test("shows loading state", async () => {
  const scope = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2015/10/10")
    .reply(200, data);
  renderWithQuery(<App />);
  scope.isDone();
  expect(await screen.findByText("Loading...")).toBeInTheDocument();
});
