import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, ArticleListResponse } from "./utils";
import { useState } from "react";
import { take } from "lodash-es";
import DatePicker from "react-datepicker";
import { format, startOfYesterday, isAfter, startOfToday } from "date-fns";

import "react-datepicker/dist/react-datepicker.css";
import ArticleListItem from "./ArticleListItem";

const articleCountOptions = [25, 50, 75, 100, 200];

function App() {
  const [articleCount, setArticleCount] = useState(100);
  const [date, setDate] = useState(startOfYesterday());
  const formattedDate = format(date, "yyyy/MM/dd");
  const inTheFuture = isAfter(date, startOfToday());

  const { isLoading, data, isError, error } = useQuery<
    ArticleListResponse,
    AxiosError
  >(
    ["top-articles", formattedDate],
    async () =>
      (
        await axios.get(
          `${API_BASE_URL}/top/en.wikipedia/all-access/${formattedDate}`
        )
      ).data,
    { enabled: !inTheFuture }
  );

  const filteredArticles = data
    ? take(
        data.items
          .flatMap((item) => item.articles)
          .filter(
            (article) =>
              !article.article.match(/\w+:[^_]/) &&
              article.article !== "Main_Page"
          ),
        articleCount
      )
    : [];

  return (
    <div className="h-screen w-screen overflow-x-hidden">
      <div className="max-w-screen-md flex flex-col w-full p-6 mx-auto">
        <h1 className="text-4xl mb-6">Grow Take Home</h1>
        <div className="flex flex-col align-baseline mb-4 justify-between space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div>
            <label htmlFor="date" className="block mb-2 text-gray-500">
              Start date:
            </label>
            <DatePicker
              name="date"
              className="border border-gray-300 px-2 py-1 rounded"
              selected={date}
              onChange={(d) => setDate(d || startOfYesterday())}
            />
          </div>
          <div>
            <label htmlFor="count" className="block mb-2 text-gray-500">
              Number of results:
            </label>
            <select
              name="count"
              className="border border-gray-300 px-2 py-1 rounded"
              value={articleCount}
              onChange={(e) => {
                console.log(e.target.value);
                setArticleCount(parseInt(e.target.value));
              }}
            >
              {articleCountOptions.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>
        </div>
        {inTheFuture ? (
          <div className="text-center text-gray-500 text-sm">
            The date you selected is in the future.
          </div>
        ) : isLoading ? (
          <div className="text-center text-gray-500 text-sm">Loading...</div>
        ) : isError ? (
          error.response?.status === 404 ? (
            <div className="text-center text-gray-500 text-sm">Not found</div>
          ) : (
            <div className="text-center text-gray-500 text-sm">
              Error: {error.message}
            </div>
          )
        ) : data ? (
          <ul className="space-y-4">
            {filteredArticles.map((article, i) => (
              <ArticleListItem
                key={article.article}
                rank={i + 1}
                name={article.article.split("_").join(" ")}
                views={article.views}
              />
            ))}
          </ul>
        ) : (
          <div>Unexpected error</div>
        )}
      </div>
    </div>
  );
}

export default App;
