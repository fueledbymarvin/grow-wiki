import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, CountryListResponse } from "./utils";
import { format, startOfMonth, subDays } from "date-fns";
import isoCountries from "i18n-iso-countries";
import isoCountriesEnglish from "i18n-iso-countries/langs/en.json";
isoCountries.registerLocale(isoCountriesEnglish);

function CountryPicker({
  date,
  value,
  onChange,
}: {
  date: Date;
  value: string;
  onChange: (value: string) => void;
}) {
  const lastMonth = subDays(startOfMonth(date), 1);
  const formattedMonth = format(lastMonth, "yyyy/MM");
  const { data } = useQuery<CountryListResponse, AxiosError>(
    ["countries", formattedMonth],
    async () =>
      (
        await axios.get(
          `${API_BASE_URL}/top-by-country/all-projects/all-access/${formattedMonth}`
        )
      ).data
  );
  const countries = data
    ? data.items
        .flatMap((item) => item.countries.map((c) => c.country))
        .filter((c) => c.match(/[A-Z][A-Z]/))
    : [value];

  return (
    <select
      name="country"
      className="border border-gray-300 px-2 py-1 rounded w-full h-9"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {countries.map((c) => (
        <option key={c} value={c}>
          {isoCountries.getName(c, "en")}
        </option>
      ))}
    </select>
  );
}

export default CountryPicker;
