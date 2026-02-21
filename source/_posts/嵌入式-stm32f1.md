---
title: STM32F103单片机开发指南
date: 2026-02-22 09:00:00
type: documents
categories: 嵌入式
tags: [STM32, 单片机, C语言]
---

## 简介

STM32F103是ST公司生产的Cortex-M3内核微控制器，性价比高，应用广泛。

## 开发环境

### 工具链

- Keil MDK
- STM32CubeMX
- OpenOCD + GCC

### 项目结构

```
Project/
├── Core/
│   ├── Inc/
│   └── Src/
├── Drivers/
└── Makefile
```

## 基础例程

### GPIO控制

```c
void GPIO_Init(void)
{
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN;
    GPIOA->CRL &= ~0x0000000F;
    GPIOA->CRL |= 0x00000003;
}

void LED_On(void)
{
    GPIOA->ODR |= (1 << 0);
}
```

### 定时器中断

```c
void TIM2_IRQHandler(void)
{
    if (TIM2->SR & TIM_SR_UIF)
    {
        TIM2->SR &= ~TIM_SR_UIF;
        // 用户代码
    }
}
```

## 总结

STM32F103适合作为入门级单片机学习，资料丰富，生态完善。
