import { useState } from "react";
import DatePicker from "react-datepicker";
import { startOfYesterday } from "date-fns";
import isoCountries from "i18n-iso-countries";
import isoCountriesEnglish from "i18n-iso-countries/langs/en.json";
import "react-datepicker/dist/react-datepicker.css";
import ArticleList from "./ArticleList";
import CountryPicker from "./CountryPicker";

isoCountries.registerLocale(isoCountriesEnglish);
const articleCountOptions = [25, 50, 75, 100, 200];

function App() {
  const [articleCount, setArticleCount] = useState(100);
  const [date, setDate] = useState(startOfYesterday());
  const [country, setCountry] = useState("US");

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
            <CountryPicker
              date={date}
              value={country}
              onChange={(c) => setCountry(c)}
            />
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
        <ArticleList count={articleCount} date={date} country={country} />
      </div>
    </div>
  );
}

export default App;
