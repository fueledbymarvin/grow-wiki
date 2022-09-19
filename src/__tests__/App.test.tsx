import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import axios from "axios";
import App from "../App";
import { API_BASE_URL, ArticleListResponse } from "../utils";
import { range } from "lodash-es";

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
  jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));
  if (!nock.isActive()) nock.activate();
});

afterEach(() => {
  jest.useRealTimers();
  nock.restore();
  queryClient.clear();
});

const genData: (name: string) => ArticleListResponse = (name) => ({
  items: [
    {
      articles: range(300).map((i) => ({
        article: `${name}${i > 0 ? i : ""}`,
        views: i,
      })),
    },
  ],
});

test("displays articles on success", async () => {
  const scope = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2019/12/30")
    .reply(200, genData("asdf"));
  renderWithQuery(<App />);
  scope.isDone();
  expect(await screen.findByText("asdf")).toBeInTheDocument();
});

test("shows error state", async () => {
  const scope = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2019/12/30")
    .reply(500);
  renderWithQuery(<App />);
  scope.isDone();
  expect(
    await screen.findByText("Error: Request failed with status code 500")
  ).toBeInTheDocument();
});

test("shows loading state", async () => {
  const scope = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2019/12/30")
    .reply(200, genData("load"));
  renderWithQuery(<App />);
  scope.isDone();
  expect(await screen.findByText("Loading...")).toBeInTheDocument();
});

test("changing the date works", async () => {
  const scope = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2019/12/30")
    .reply(200, genData("old"));
  const scope2 = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2019/12/29")
    .reply(200, genData("new"));
  renderWithQuery(<App />);
  fireEvent.input(await screen.findByDisplayValue("12/30/2019"), {
    target: { value: "12/29/2019" },
  });
  scope.isDone();
  scope2.isDone();
  expect(await screen.findByText("new")).toBeInTheDocument();
});

test("changing the date to the future shows an error message", async () => {
  const scope = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2019/12/30")
    .reply(200, genData("old"));
  renderWithQuery(<App />);
  fireEvent.input(await screen.findByDisplayValue("12/30/2019"), {
    target: { value: "01/02/2020" },
  });
  scope.isDone();
  expect(
    await screen.findByText("The date you selected is in the future.")
  ).toBeInTheDocument();
});

test("shows 100 results by default", async () => {
  const scope = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2019/12/30")
    .reply(200, genData("old"));
  renderWithQuery(<App />);
  scope.isDone();
  const listItems = await screen.findAllByRole("listitem");
  expect(listItems).toHaveLength(100);
});

test("changing the number of results works", async () => {
  const scope = nock(API_BASE_URL)
    .get("/top/en.wikipedia/all-access/2019/12/30")
    .reply(200, genData("number"));
  renderWithQuery(<App />);
  fireEvent.change(await screen.findByDisplayValue("100"), {
    target: { value: "50" },
  });
  scope.isDone();
  const listItems = await screen.findAllByRole("listitem");
  expect(listItems).toHaveLength(50);
});
