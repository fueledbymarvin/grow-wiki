This is a React app for the Grow Therapy take home assignment.

## Use

First `npm install` then `npm run dev` to run the app. You can run the tests using `npm run test`.

## Considerations

- I was not able to find documentation on how to limit the number of results for the Wikipedia API so that's done client side
- I tried to filter out special Wikipedia pages that aren't actual articles
- One of these pages is "Main_Page", but I realized it would be difficult to filter it out in all the different languages so only the English version is filtered out
- For the enhancement, I chose to add a country selector
- I get the countries from a different Wikipedia endpoint which actually depends on the month
- The country data is from the previous month because the current month will 404 since the data is not yet complete
- If we needed to improve performance on fetching countries, that could easily be cached
- For testing, I focused on writing high-level integration tests
- I felt that unit tests for every component was overkill for this small project
