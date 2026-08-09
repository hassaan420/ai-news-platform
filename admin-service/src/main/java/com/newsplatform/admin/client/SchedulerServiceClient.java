package com.newsplatform.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "scheduler-service", url = "${feign.client.scheduler-service.url:http://scheduler-service:8085}")
public interface SchedulerServiceClient {
    @PostMapping("/api/scheduler/trigger")
    String triggerFetch();
}
