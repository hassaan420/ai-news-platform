# Dawn News Web Scraper API

An API built with 🚀 Go, 🕷️ Colly and the 🧞 Gin web framework that scrapes news articles from Dawn.com

## API Documentation

The endpoints of this API have been documented with Swagger

Base URL: `<host>:3000/api/v1/`

Swagger API Docs: `<host>:3000/swagger/index.html`

## API Usage

This section gives you a brief introduction to the 📰 Dawn News Web Scraper API

### To query the API for the latest news articles published on Dawn.com

- Endpoint: `<host>:3000/api/v1/latest-news/`

The API will respond with the following attributes for each article in JSON format:

- Article title (headline)
- Link to the article on Dawn.Com (url)
- Date and time at which the article was published (timestamp)
- An excerpt of the story contained in the article (excerpt)

### Sample JSON Response

```json
[
  {
    "headline": "Shinzo Abe’s body returns to his home as Japan grieves for slain ex-PM",
    "url": "https://www.dawn.com/news/1699005/shinzo-abes-body-returns-to-his-home-as-japan-grieves-for-slain-ex-pm",
    "timestamp": "2022-07-09 04:26 PM",
    "excerpt": "Abe, 67, served twice as prime minister, stepping down citing ill health on both occasions."
  },
  {
    "headline": "Sri Lanka protesters storm president's house after clashing with police",
    "url": "https://www.dawn.com/news/1698986/sri-lanka-protesters-storm-presidents-house-after-clashing-with-police",
    "timestamp": "2022-07-09 03:11 PM",
    "excerpt": "PM summons emergency meeting; at least 21 people, including two policemen, have been injured in the ongoing protests."
  },
  {
    "headline": "US, Chinese foreign ministers hold first in person talks since October",
    "url": "https://www.dawn.com/news/1698981/us-chinese-foreign-ministers-hold-first-in-person-talks-since-october",
    "timestamp": "2022-07-09 12:12 PM",
    "excerpt": "Officials say the meeting aimed at keeping difficult US relationship with China stable."
  },
  {
    "headline": "Sopranos actor Tony Sirico dies at age 79",
    "url": "https://www.dawn.com/news/1698979/sopranos-actor-tony-sirico-dies-at-age-79",
    "timestamp": "2022-07-09 10:48 AM",
    "excerpt": "He was known for playing Paulie Walnuts, a mobster in the hit show that started in 1999."
  },
  {
    "headline": "Twitter vows legal fight after Elon Musk pulls out of $44bn deal",
    "url": "https://www.dawn.com/news/1698978/twitter-vows-legal-fight-after-elon-musk-pulls-out-of-44bn-deal",
    "timestamp": "2022-07-09 04:27 PM",
    "excerpt": "\"Twitter Board is committed to closing the transaction on the price and terms agreed upon with Mr. Musk,\" says chairman Bret Taylor."
  }
]
```

### To query the information for a news article published on Dawn.com

- Each article is identified by a unique ID
- For instance: [https://www.dawn.com/news/**1698978**](https://www.dawn.com/news/1698978)
- The number followed by "https://www.dawn.com/news/" is this article's ID
- Pass this ID as a parameter to the Dawn News API as follows: `<host>:3000/api/v1/article/1698978`

The API will respond with the following attributes for the queried article in JSON format:

- Article title (title)
- Link to the article on Dawn.Com (url)
- Date and time at which the article was published (timestamp)
- Story contained in the article (story)

### Sample JSON Response

```json
{
  "title": "Twitter vows legal fight after Elon Musk pulls out of $44bn deal",
  "url": "https://www.dawn.com/news/1698978/twitter-vows-legal-fight-after-elon-musk-pulls-out-of-44bn-deal",
  "timestamp": "2022-07-09 04:27 PM",
  "story": "Elon Musk, the chief executive officer of Tesla and the world's richest person, has said he was terminating his $44 billion deal to buy Twitter because the social media company had breached multiple provisions of the merger agreement..."
}
```
