---
title: STM32F103单片机开发指南
date: 2025-02-22 09:00:00
type: documents
categories: 嵌入式
tags: [STM32, 单片机, C语言]
---
STM32F103是ST公司生产的Cortex-M3内核微控制器，性价比高，应用广泛。

<!--more-->

## 芯片简介

STM32F103系列是ST意法半导体推出的基于ARM Cortex-M3内核的32位微控制器，主频72MHz，集成丰富的外设资源。

### 主要特性

- 内核: ARM Cortex-M3 32-bit RISC
- 主频: 72MHz
- 闪存: 64KB-128KB
- SRAM: 20KB
- 外设: GPIO, USART, SPI, I2C, ADC, DMA, Timer, PWM
- 供电: 2.0V - 3.6V

## 开发环境

### 硬件准备

-103开发板
- ST STM32F-Link下载器
- 串口模块
- 面包板及杜邦线

### 软件工具

```bash
# 安装ARM GCC工具链
sudo apt-get install gcc-arm-none-eabi

# 安装OpenOCD
sudo apt-get install openocd

# 安装ST-Link工具
sudo apt-get install stlink-tools
```

### 项目结构

```
Project/
├── Core/
│   ├── Inc/
│   │   ├── main.h
│   │   ├── stm32f1xx_hal.h
│   │   └── stm32f1xx_it.h
│   └── Src/
│       ├── main.c
│       ├── stm32f1xx_it.c
│       └── system_stm32f1xx.c
├── Drivers/
│   ├── CMSIS/
│   └── STM32F1xx_HAL_Driver/
├── Makefile
└── STM32F103C8TX_FLASH.ld
```

## 基础例程

### 1. GPIO控制

```c
#include "stm32f10x.h"

void GPIO_Init(void)
{
    // 使能GPIOA时钟
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN;
    
    // 配置PA0为推挽输出
    GPIOA->CRL &= ~0x0000000F;  // 清除
    GPIOA->CRL |= 0x00000003;   // 50MHz推挽输出
}

void LED_On(void)
{
    GPIOA->ODR |= (1 << 0);  // PA0输出高
}

void LED_Off(void)
{
    GPIOA->ODR &= ~(1 << 0);  // PA0输出低
}

int main(void)
{
    GPIO_Init();
    while(1)
    {
        LED_On();
        Delay(500);
        LED_Off();
        Delay(500);
    }
}
```

### 2. 串口通信

```c
#include "stm32f10x.h"

void USART1_Init(void)
{
    // 使能时钟
    RCC->APB2ENR |= RCC_APB2ENR_USART1EN;
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN;
    
    // PA9配置为复用推挽输出
    GPIOA->CRH &= ~0x00000FF0;
    GPIOA->CRH |= 0x00000B10;
    
    // 配置USART1
    USART1->BRR = 72000000 / 115200;  // 波特率115200
    USART1->CR1 |= USART_CR1_TE | USART_CR1_RE;  // 使能发送接收
    USART1->CR1 |= USART_CR1_UE;  // 使能USART
}

void USART_SendByte(uint8_t ch)
{
    while(!(USART1->SR & USART_SR_TXE));  // 等待发送完成
    USART1->DR = ch;
}

void USART_SendString(char *str)
{
    while(*str)
    {
        USART_SendByte(*str++);
    }
}
```

### 3. 定时器中断

```c
void TIM2_Init(void)
{
    // 使能TIM2时钟
    RCC->APB1ENR |= RCC_APB1ENR_TIM2EN;
    
    // 配置定时器
    TIM2->PSC = 7200 - 1;    // 预分频，10kHz
    TIM2->ARR = 10000 - 1;   // 1秒中断
    TIM2->DIER |= TIM_DIER_UIE;  // 使能更新中断
    TIM2->CR1 |= TIM_CR1_CEN;    // 使能定时器
    
    // 配置NVIC
    NVIC_EnableIRQ(TIM2_IRQn);
}

void TIM2_IRQHandler(void)
{
    if(TIM2->SR & TIM_SR_UIF)
    {
        TIM2->SR &= ~TIM_SR_UIF;  // 清除中断标志
        // 用户代码
    }
}
```

### 4. PWM输出

```c
void PWM_Init(void)
{
    // 使能时钟
    RCC->APB1ENR |= RCC_APB1ENR_TIM3EN;
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN;
    
    // PA6配置为复用推挽输出
    GPIOA->CRL &= ~0x0F000000;
    GPIOA->CRL |= 0x0B000000;
    
    // 配置TIM3
    TIM3->PSC = 72 - 1;
    TIM3->ARR = 1000;
    TIM3->CCR1 = 500;  // 50%占空比
    
    TIM3->CCMR1 |= TIM_CCMR1_OC1M_1 | TIM_CCMR1_OC1M_2;  // PWM模式1
    TIM3->CCER |= TIM_CCER_CC1E;  // 使能通道1
    TIM3->CR1 |= TIM_CR1_CEN;
}
```

## 总结

STM32F103适合作为入门级单片机学习，资料丰富，生态完善。通过本指南的学习，你可以掌握STM32的基本开发流程，为更复杂的项目打下坚实基础。
