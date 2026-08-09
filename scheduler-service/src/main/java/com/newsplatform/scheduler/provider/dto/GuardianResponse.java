package com.newsplatform.scheduler.provider.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GuardianResponse {
    private ResponseData response;

    public ResponseData getResponse() { return response; }
    public void setResponse(ResponseData response) { this.response = response; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseData {
        private String status;
        private List<Result> results;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public List<Result> getResults() { return results; }
        public void setResults(List<Result> results) { this.results = results; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {
        private String webTitle;
        private String webUrl;
        private String webPublicationDate;
        private Fields fields;

        public String getWebTitle() { return webTitle; }
        public void setWebTitle(String webTitle) { this.webTitle = webTitle; }

        public String getWebUrl() { return webUrl; }
        public void setWebUrl(String webUrl) { this.webUrl = webUrl; }

        public String getWebPublicationDate() { return webPublicationDate; }
        public void setWebPublicationDate(String webPublicationDate) { this.webPublicationDate = webPublicationDate; }

        public Fields getFields() { return fields; }
        public void setFields(Fields fields) { this.fields = fields; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Fields {
        private String thumbnail;
        private String bodyText;

        public String getThumbnail() { return thumbnail; }
        public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

        public String getBodyText() { return bodyText; }
        public void setBodyText(String bodyText) { this.bodyText = bodyText; }
    }
}
