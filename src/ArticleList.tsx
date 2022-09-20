import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, ArticleListResponse } from "./utils";
import { take } from "lodash-es";
import { format, isAfter, startOfToday } from "date-fns";
import ArticleListItem from "./ArticleListItem";

function ArticleList({
  count,
  date,
  country,
}: {
  count: number;
  date: Date;
  country: string;
}) {
  const inTheFuture = isAfter(date, startOfToday());
  const formattedDate = format(date, "yyyy/MM/dd");
  const { isLoading, isError, error, data } = useQuery<
    ArticleListResponse,
    AxiosError
  >(
    ["top-articles", country, formattedDate],
    async () =>
      (
        await axios.get(
          `${API_BASE_URL}/top-per-country/${country}/all-access/${formattedDate}`
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
        count
      )
    : [];

  return inTheFuture ? (
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
  );
}

export default ArticleList;
