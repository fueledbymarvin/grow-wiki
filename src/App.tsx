import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  API_BASE_URL,
  ArticleListResponse,
  CountryListResponse,
} from "./utils";
import { useState } from "react";
import { take } from "lodash-es";
import DatePicker from "react-datepicker";
import {
  format,
  startOfYesterday,
  isAfter,
  startOfToday,
  startOfMonth,
  subDays,
} from "date-fns";
import isoCountries from "i18n-iso-countries";
import isoCountriesEnglish from "i18n-iso-countries/langs/en.json";
isoCountries.registerLocale(isoCountriesEnglish);

import "react-datepicker/dist/react-datepicker.css";
import ArticleListItem from "./ArticleListItem";

const articleCountOptions = [25, 50, 75, 100, 200];

function App() {
  const [articleCount, setArticleCount] = useState(100);

  const [date, setDate] = useState(startOfYesterday());
  const formattedDate = format(date, "yyyy/MM/dd");
  const inTheFuture = isAfter(date, startOfToday());
  const lastMonth = subDays(startOfMonth(date), 1);
  const formattedMonth = format(lastMonth, "yyyy/MM");

  const [country, setCountry] = useState("US");
  const countryQuery = useQuery<CountryListResponse, AxiosError>(
    ["countries", formattedMonth],
    async () =>
      (
        await axios.get(
          `${API_BASE_URL}/top-by-country/all-projects/all-access/${formattedMonth}`
        )
      ).data
  );
  const countries = countryQuery.data
    ? countryQuery.data.items
        .flatMap((item) => item.countries.map((c) => c.country))
        .filter((c) => c.match(/[A-Z][A-Z]/))
    : [country];

  const articleQuery = useQuery<ArticleListResponse, AxiosError>(
    ["top-articles", country, formattedDate],
    async () =>
      (
        await axios.get(
          `${API_BASE_URL}/top-per-country/${country}/all-access/${formattedDate}`
        )
      ).data,
    { enabled: !inTheFuture }
  );
  const filteredArticles = articleQuery.data
    ? take(
        articleQuery.data.items
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
        <div className="sm:columns-3 space-y-4 mb-6">
          <div>
            <label htmlFor="date" className="block mb-2 text-gray-500">
              Start date:
            </label>
            <DatePicker
              name="date"
              className="border border-gray-300 px-2 rounded w-full h-9"
              selected={date}
              onChange={(d) => setDate(d || startOfYesterday())}
            />
          </div>
          <div>
            <label htmlFor="country" className="block mb-2 text-gray-500">
              Country:
            </label>
            <select
              name="country"
              className="border border-gray-300 px-2 py-1 rounded w-full h-9"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {isoCountries.getName(c, "en")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="count" className="block mb-2 text-gray-500">
              Number of results:
            </label>
            <select
              name="count"
              className="border border-gray-300 px-2 py-1 rounded w-full h-9"
              value={articleCount}
              onChange={(e) => setArticleCount(parseInt(e.target.value))}
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
        ) : articleQuery.isLoading ? (
          <div className="text-center text-gray-500 text-sm">Loading...</div>
        ) : articleQuery.isError ? (
          articleQuery.error.response?.status === 404 ? (
            <div className="text-center text-gray-500 text-sm">Not found</div>
          ) : (
            <div className="text-center text-gray-500 text-sm">
              Error: {articleQuery.error.message}
            </div>
          )
        ) : filteredArticles.length ? (
          <ul className="space-y-4">
            {filteredArticles.map((article, i) => (
              <ArticleListItem
                key={[article.article, article.views_ceil].join(":")}
                rank={i + 1}
                name={article.article.split("_").join(" ")}
                views={article.views_ceil}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 text-sm">No results</div>
        )}
      </div>
    </div>
  );
}

export default App;
