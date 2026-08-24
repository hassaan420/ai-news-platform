package com.newsplatform.news.dto;

import java.util.List;

public class CategoryMetricsResponse {

    private List<SummaryMetric> summaries;
    private List<ChartDataPoint> chartData;

    public CategoryMetricsResponse() {}

    public CategoryMetricsResponse(List<SummaryMetric> summaries, List<ChartDataPoint> chartData) {
        this.summaries = summaries;
        this.chartData = chartData;
    }

    public List<SummaryMetric> getSummaries() {
        return summaries;
    }

    public void setSummaries(List<SummaryMetric> summaries) {
        this.summaries = summaries;
    }

    public List<ChartDataPoint> getChartData() {
        return chartData;
    }

    public void setChartData(List<ChartDataPoint> chartData) {
        this.chartData = chartData;
    }

    public static class SummaryMetric {
        private String title;
        private String metric;
        private String icon;

        public SummaryMetric() {}

        public SummaryMetric(String title, String metric, String icon) {
            this.title = title;
            this.metric = metric;
            this.icon = icon;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getMetric() { return metric; }
        public void setMetric(String metric) { this.metric = metric; }

        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
    }

    public static class ChartDataPoint {
        private String name;
        private Long value;

        public ChartDataPoint() {}

        public ChartDataPoint(String name, Long value) {
            this.name = name;
            this.value = value;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Long getValue() { return value; }
        public void setValue(Long value) { this.value = value; }
    }
}
