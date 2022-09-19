import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, ArticleListResponse } from "./utils";

function App() {
  const { isLoading, data, isError, error } = useQuery<
    ArticleListResponse,
    AxiosError
  >(
    ["top-articles"],
    async () =>
      (
        await axios.get(
          `${API_BASE_URL}/top/en.wikipedia/all-access/2015/10/10`
        )
      ).data
  );

  const filteredArticles = data
    ? data.items
        .flatMap((item) => item.articles)
        .filter(
          (article) =>
            !article.article.match(/\w+:[^_]/) &&
            article.article !== "Main_Page"
        )
    : [];

  return (
    <div className="h-screen w-screen">
      <div className="max-w-lg flex flex-col w-full p-6 mx-auto">
        <h1 className="text-4xl mb-6">Grow Take Home</h1>
        {isLoading ? (
          <div className="text-center text-gray-500 text-sm">Loading...</div>
        ) : isError ? (
          error.response?.status === 404 ? (
            <div className="text-center text-gray-500 text-sm">0 results</div>
          ) : (
            <div className="text-center text-gray-500 text-sm">
              Error: {error.message}
            </div>
          )
        ) : data ? (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div key={article.article}>
                {article.article.split("_").join(" ")}
              </div>
            ))}
          </div>
        ) : (
          <div>Unexpected error</div>
        )}
      </div>
    </div>
  );
}

export default App;
