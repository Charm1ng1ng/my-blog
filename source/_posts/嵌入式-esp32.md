---
title: ESP32单片机开发指南
date: 2026-01-22 09:00:00
type: documents
categories: 嵌入式
tags: [ESP32, 单片机, C语言]
---
ESP32是乐鑫公司生产的微控制器，性价比高，应用广泛。

<!--more-->

## 芯片简介

ESP32是乐鑫信息科技推出的低功耗系统级芯片，集成Wi-Fi和蓝牙双模无线通信功能。

### 主要特性

- 处理器: Xtensa LX6双核 @ 240MHz
- 内存: 520KB SRAM
- 存储: 4MB SPI Flash
- 无线: Wi-Fi 802.11 b/g/n + Bluetooth 4.2/BLE
- 外设: GPIO, UART, SPI, SDIO, I2C, LED PWM, ADC, DAC
- 供电: 2.3V - 3.6V

## 开发环境

### ESP-IDF安装

```bash
# 克隆ESP-IDF
git clone --recursive https://github.com/espressif/esp-idf.git
cd esp-idf

# 安装依赖
./install.sh esp32

# 激活环境
source export.sh
```

### 项目结构

```
my_esp32_project/
├── main/
│   ├── CMakeLists.txt
│   └── app_main.c
├── components/
├── CMakeLists.txt
└── sdkconfig
```

## 基础例程

### 1. Hello World

```c
#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"

void app_main(void)
{
    printf("Hello ESP32!\n");
    
    while(1) {
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
```

### 2. GPIO控制

```c
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define LED_PIN 2

void app_main(void)
{
    // 配置GPIO为输出模式
    gpio_reset_pin(LED_PIN);
    gpio_set_direction(LED_PIN, GPIO_MODE_OUTPUT);
    
    while(1)
    {
        gpio_set_level(LED_PIN, 1);  // LED亮
        vTaskDelay(500 / portTICK_PERIOD_MS);
        gpio_set_level(LED_PIN, 0);  // LED灭
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}
```

### 3. Wi-Fi连接

```c
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"

#define WIFI_SSID "YourSSID"
#define WIFI_PASS "YourPassword"

static void wifi_event_handler(void* arg, esp_event_base_t event_base,
                                int32_t event_id, void* event_data)
{
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START)
    {
        esp_wifi_connect();
    }
    else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED)
    {
        esp_wifi_connect();
    }
    else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP)
    {
        ip_event_got_ip_t* event = (ip_event_got_ip_t*) event_data;
        printf("Got IP: %s\n", ip4addr_ntoa(&event->ip_info.ip));
    }
}

void wifi_init_sta(void)
{
    esp_netif_create_default_wifi_sta();
    
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    esp_wifi_init(&cfg);
    
    esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL);
    esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL);
    
    wifi_config_t wifi_config = {
        .sta = {
            .threshold.authmode = WIFI_AUTH_WPA2_PSK,
        },
    };
    memcpy(wifi_config.sta.ssid, WIFI_SSID, strlen(WIFI_SSID));
    memcpy(wifi_config.sta.password, WIFI_PASS, strlen(WIFI_PASS));
    
    esp_wifi_set_mode(WIFI_MODE_STA);
    esp_wifi_set_config(WIFI_IF_STA, &wifi_config);
    esp_wifi_start();
}

void app_main(void)
{
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    
    wifi_init_sta();
}
```

### 4. MQTT通信

```c
#include "mqtt_client.h"

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, 
                                int32_t event_id, void *event_data)
{
    esp_mqtt_event_handle_t event = event_data;
    switch(event->event_id)
    {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(TAG, "MQTT_EVENT_CONNECTED");
            esp_mqtt_client_subscribe(client, "/topic/test", 0);
            break;
        case MQTT_EVENT_DATA:
            printf("TOPIC=%.*s\r\n", event->topic_len, event->topic);
            printf("DATA=%.*s\r\n", event->data_len, event->data);
            break;
        default:
            break;
    }
}

void app_main(void)
{
    esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = "mqtt://broker.emqx.io:1883",
    };
    esp_mqtt_client_handle_t client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
    esp_mqtt_client_start(client);
}
```

### 5. 蓝牙BLE

```c
#include "esp_bt.h"
#include "esp_gap_ble_api.h"

static void gap_event_handler(esp_gap_ble_cb_event_t event, 
                              esp_ble_gap_cb_param_t *param)
{
    switch(event)
    {
        case ESP_GAP_BLE_ADV_DATA_SET_COMPLETE_EVT:
            esp_ble_gap_start_advertising(&adv_params);
            break;
        default:
            break;
    }
}

void app_main(void)
{
    esp_bt_controller_init();
    esp_bt_controller_enable(ESP_BT_MODE_BLE);
    esp_bluedroid_init();
    esp_bluedroid_enable();
    esp_ble_gap_register_callback(gap_event_handler);
    
    // 配置广播参数
    adv_params.adv_int_min = 0x20;
    adv_params.adv_int_max = 0x40;
    adv_params.adv_type = ADV_TYPE_IND;
    adv_params.own_addr_type = BLE_ADDR_TYPE_PUBLIC;
    // ... 更多配置
}
```

## 总结

ESP32凭借其强大的无线通信能力和丰富的生态，是物联网开发的理想选择。无论是智能家居还是工业控制，ESP32都能胜任。
